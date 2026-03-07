# backend/pricing/calculator.py
from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def decimal_to_json_safe(obj, decimal_places=0):
    """Convert Decimal to JSON-serializable int/float for IDR"""
    if isinstance(obj, Decimal):
        if decimal_places == 0:
            return int(obj.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
        return float(obj.quantize(Decimal(10) ** -decimal_places, rounding=ROUND_HALF_UP))
    return obj


def convert_price_breakdown(breakdown, decimal_places=0):
    """Recursively convert Decimal values to JSON-safe format"""
    if isinstance(breakdown, dict):
        return {k: convert_price_breakdown(v, decimal_places) for k, v in breakdown.items()}
    elif isinstance(breakdown, list):
        return [convert_price_breakdown(item, decimal_places) for item in breakdown]
    else:
        return decimal_to_json_safe(breakdown, decimal_places)


class PricingCalculator:
    """
    Pricing calculator for manufacturing services - IDR Currency
    All prices in Indonesian Rupiah (Rp)
    """
    
    CURRENCY = 'IDR'
    DECIMAL_PLACES = 0  # IDR typically has no decimal places
    
    @staticmethod
    def _round_idr(value):
        """Round to nearest IDR (no decimals)"""
        if isinstance(value, Decimal):
            return int(value.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
        return int(round(value))
    
    @staticmethod
    def calculate_3d_printing_price(
        volume_cm3,
        surface_area_cm2,
        weight_grams,
        bounding_box,
        material='PLA',
        layer_height=0.2,
        infill_percentage=20,
        support_material=False
    ):
        """
        Calculate price for 3D printing in IDR
        
        Args:
            volume_cm3: Volume in cubic centimeters
            weight_grams: Estimated weight in grams
            bounding_box: Tuple of (x, y, z) in mm
            material: Material type (PLA, ABS, PETG, etc.)
            layer_height: Layer height in mm (0.1-0.4)
            infill_percentage: Infill percentage (0-100)
            support_material: Whether support material is needed
        
        Returns:
            dict: Price breakdown in IDR
        """
        config = settings.PRICING_CONFIG['3D_PRINTING']
        
        if material not in config:
            raise ValueError(f"Unsupported material: {material}")
        
        material_config = config[material]
        
        # 1. Material cost (Rp)
        material_cost = Decimal(str(weight_grams)) * Decimal(str(material_config['material_cost_per_gram']))
        
        # 2. Calculate print time estimation
        # Base: ~0.1 hours per cm³ at 0.2mm layer height
        base_print_time_hours = Decimal(str(volume_cm3)) * Decimal('0.1') / Decimal(str(layer_height))
        
        # Adjust for infill percentage
        infill_factor = Decimal(str(infill_percentage)) / Decimal('100')
        adjusted_print_time = base_print_time_hours * infill_factor
        
        # Add support material time (+30%)
        if support_material:
            adjusted_print_time *= Decimal('1.3')
        
        # 3. Machine cost (Rp)
        machine_cost = adjusted_print_time * Decimal(str(material_config['machine_cost_per_hour']))
        
        # 4. Setup fee (Rp)
        setup_fee = Decimal(str(material_config['setup_fee']))
        
        # 5. Complexity factor (surface area to volume ratio)
        if volume_cm3 > 0:
            complexity_ratio = surface_area_cm2 / volume_cm3
            # Higher ratio = more complex = higher price
            complexity_multiplier = Decimal('1.0') + (Decimal(str(complexity_ratio)) * Decimal('0.005'))
            complexity_multiplier = min(complexity_multiplier, Decimal('2.0'))  # Cap at 2x
        else:
            complexity_multiplier = Decimal('1.0')
        
        # 6. Quantity discount (for bulk orders)
        quantity = 1  # Default, can be passed as parameter
        if quantity >= 10:
            quantity_discount = Decimal('0.85')  # 15% discount
        elif quantity >= 5:
            quantity_discount = Decimal('0.90')  # 10% discount
        elif quantity >= 3:
            quantity_discount = Decimal('0.95')  # 5% discount
        else:
            quantity_discount = Decimal('1.0')
        
        # 7. Calculate total
        subtotal = (material_cost + machine_cost + setup_fee) * complexity_multiplier
        total = subtotal * quantity_discount
        
        # 8. Apply minimum price (Rp 10.000)
        minimum_price = Decimal('10000')
        final_price = max(total, minimum_price)
        
        # 9. Build result with IDR formatting
        result = {
            'material_cost': PricingCalculator._round_idr(material_cost),
            'machine_cost': PricingCalculator._round_idr(machine_cost),
            'setup_fee': PricingCalculator._round_idr(setup_fee),
            'print_time_hours': round(float(adjusted_print_time), 2),
            'complexity_multiplier': round(float(complexity_multiplier), 2),
            'quantity_discount': f"{float((Decimal('1') - quantity_discount) * 100):.0f}%",
            'subtotal': PricingCalculator._round_idr(subtotal),
            'total_price': PricingCalculator._round_idr(final_price),
            'currency': 'IDR',
            'currency_symbol': 'Rp',
        }
        
        # Ensure all values are JSON-serializable
        return convert_price_breakdown(result, PricingCalculator.DECIMAL_PLACES)
    
    @staticmethod
    def calculate_cnc_price(
        volume_cm3,
        surface_area_cm2,
        bounding_box,
        material='ALUMINUM',
        complexity='MEDIUM',
        quantity=1
    ):
        """Calculate price for CNC machining in IDR"""
        config = settings.PRICING_CONFIG['CNC_MACHINING']
        
        if material not in config:
            raise ValueError(f"Unsupported material: {material}")
        
        material_config = config[material]
        
        # Material cost
        material_cost = Decimal(str(volume_cm3)) * Decimal(str(material_config['material_cost_per_cm3']))
        
        # Complexity factors
        complexity_factors = {
            'SIMPLE': Decimal('0.8'),
            'MEDIUM': Decimal('1.0'),
            'COMPLEX': Decimal('1.5'),
            'VERY_COMPLEX': Decimal('2.0'),
        }
        complexity_factor = complexity_factors.get(complexity, Decimal('1.0'))
        
        # Machining time: ~0.05 hours per cm³ base
        machining_time_hours = (Decimal(str(volume_cm3)) * Decimal('0.05')) * complexity_factor
        
        machine_cost = machining_time_hours * Decimal(str(material_config['machine_cost_per_hour']))
        setup_fee = Decimal(str(material_config['setup_fee']))
        
        # Quantity discount
        if quantity >= 10:
            quantity_discount = Decimal('0.80')
        elif quantity >= 5:
            quantity_discount = Decimal('0.90')
        else:
            quantity_discount = Decimal('1.0')
        
        total = (material_cost + machine_cost + setup_fee) * quantity_discount
        
        # Minimum price for CNC: Rp 50.000
        minimum_price = Decimal('50000')
        final_price = max(total, minimum_price)
        
        result = {
            'material_cost': PricingCalculator._round_idr(material_cost),
            'machine_cost': PricingCalculator._round_idr(machine_cost),
            'setup_fee': PricingCalculator._round_idr(setup_fee),
            'machining_time_hours': round(float(machining_time_hours), 2),
            'complexity': complexity,
            'quantity_discount': f"{float((Decimal('1') - quantity_discount) * 100):.0f}%",
            'total_price': PricingCalculator._round_idr(final_price),
            'currency': 'IDR',
            'currency_symbol': 'Rp',
        }
        
        return convert_price_breakdown(result, PricingCalculator.DECIMAL_PLACES)
    
    @staticmethod
    def calculate_laser_cutting_price(
        surface_area_cm2,
        bounding_box,
        material='ACRYLIC_3MM',
        thickness_mm=3,
        cut_length_cm=0,
        quantity=1
    ):
        """Calculate price for laser cutting in IDR"""
        config = settings.PRICING_CONFIG['LASER_CUTTING']
        
        if material not in config:
            raise ValueError(f"Unsupported material: {material}")
        
        material_config = config[material]
        
        # Material cost
        material_cost = Decimal(str(surface_area_cm2)) * Decimal(str(material_config['material_cost_per_cm2']))
        
        # Estimate cut length from bounding box if not provided
        if cut_length_cm <= 0:
            # Perimeter estimate + internal cuts estimate
            cut_length_cm = ((bounding_box[0] or 0) + (bounding_box[1] or 0)) * 2 / 10  # cm
            cut_length_cm *= 1.5  # Add 50% for internal cuts
        
        # Cutting time: speed varies by material thickness
        cutting_speed_cm_per_min = Decimal('40')  # Average speed
        cutting_time_min = Decimal(str(cut_length_cm)) / cutting_speed_cm_per_min
        cutting_time_min = max(cutting_time_min, Decimal('3'))  # Minimum 3 minutes
        
        machine_cost = cutting_time_min * Decimal(str(material_config['machine_cost_per_minute']))
        setup_fee = Decimal(str(material_config['setup_fee']))
        
        # Quantity discount
        if quantity >= 20:
            quantity_discount = Decimal('0.75')
        elif quantity >= 10:
            quantity_discount = Decimal('0.85')
        elif quantity >= 5:
            quantity_discount = Decimal('0.90')
        else:
            quantity_discount = Decimal('1.0')
        
        total = (material_cost + machine_cost + setup_fee) * quantity_discount
        
        # Minimum price for laser: Rp 15.000
        minimum_price = Decimal('15000')
        final_price = max(total, minimum_price)
        
        result = {
            'material_cost': PricingCalculator._round_idr(material_cost),
            'machine_cost': PricingCalculator._round_idr(machine_cost),
            'setup_fee': PricingCalculator._round_idr(setup_fee),
            'cut_length_cm': round(float(cut_length_cm), 1),
            'cutting_time_minutes': round(float(cutting_time_min), 1),
            'quantity_discount': f"{float((Decimal('1') - quantity_discount) * 100):.0f}%",
            'total_price': PricingCalculator._round_idr(final_price),
            'currency': 'IDR',
            'currency_symbol': 'Rp',
        }
        
        return convert_price_breakdown(result, PricingCalculator.DECIMAL_PLACES)