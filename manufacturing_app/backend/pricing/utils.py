# backend/pricing/utils.py
from django.conf import settings


def format_idr(amount, include_symbol=True, locale='id_ID'):
    """
    Format amount as Indonesian Rupiah
    
    Args:
        amount: Number or string amount
        include_symbol: Whether to include 'Rp' prefix
        locale: Locale for formatting (id_ID or en_US)
    
    Returns:
        str: Formatted currency string
    """
    try:
        # Convert to int if needed (IDR has no decimals)
        amount_int = int(float(amount))
    except (ValueError, TypeError):
        return "Rp 0"
    
    # Indonesian number formatting: 1.000.000
    if locale == 'id_ID':
        # Format with dots as thousands separator
        formatted = f"{amount_int:,}".replace(',', 'X').replace('.', ',').replace('X', '.')
    else:
        # US format: 1,000,000
        formatted = f"{amount_int:,}"
    
    if include_symbol:
        return f"Rp {formatted}"
    return formatted


def parse_idr(currency_string):
    """
    Parse Indonesian Rupiah string to integer
    
    Args:
        currency_string: e.g., "Rp 1.000.000" or "1.000.000"
    
    Returns:
        int: Amount in IDR
    """
    if not currency_string:
        return 0
    
    # Remove 'Rp' and whitespace
    cleaned = currency_string.replace('Rp', '').replace('Rp ', '').strip()
    
    # Remove Indonesian formatting (dots as thousands, comma as decimal)
    cleaned = cleaned.replace('.', '').replace(',', '')
    
    try:
        return int(cleaned)
    except ValueError:
        return 0