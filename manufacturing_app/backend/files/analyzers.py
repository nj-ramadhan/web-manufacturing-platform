import numpy as np
from stl import mesh
import trimesh
import magic
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class STLAnalyzer:
    """Analyzer for STL files"""
    
    @staticmethod
    def analyze(file_path):
        """
        Analyze STL file and extract geometry information
        Returns dict with volume, surface area, bounding box, etc.
        """
        try:
            # Load mesh using trimesh (more robust)
            mesh_obj = trimesh.load(file_path)
            
            # Handle scene objects (multiple meshes)
            if isinstance(mesh_obj, trimesh.Scene):
                meshes = [g for g in mesh_obj.geometry.values() if isinstance(g, trimesh.Trimesh)]
                if not meshes:
                    raise ValueError("No valid meshes found in file")
                # Combine all meshes
                mesh_obj = trimesh.util.concatenate(meshes)
            
            # Calculate volume (convert to cm³)
            volume_cm3 = abs(mesh_obj.volume) / 1000 if mesh_obj.volume else 0
            
            # Calculate surface area (convert to cm²)
            surface_area_cm2 = mesh_obj.area / 100 if mesh_obj.area else 0
            
            # Get bounding box dimensions (in mm)
            bounds = mesh_obj.bounds
            if bounds is not None:
                bbox_x = bounds[1][0] - bounds[0][0]  # mm
                bbox_y = bounds[1][1] - bounds[0][1]
                bbox_z = bounds[1][2] - bounds[0][2]
            else:
                bbox_x = bbox_y = bbox_z = 0
            
            # Calculate estimated weight (assuming PLA density: 1.24 g/cm³)
            density_pla = 1.24  # g/cm³
            weight_grams = volume_cm3 * density_pla
            
            return {
                'is_valid': True,
                'volume': round(volume_cm3, 3),
                'surface_area': round(surface_area_cm2, 3),
                'bounding_box_x': round(bbox_x, 2),
                'bounding_box_y': round(bbox_y, 2),
                'bounding_box_z': round(bbox_z, 2),
                'weight': round(weight_grams, 2),
                'vertices': len(mesh_obj.vertices),
                'faces': len(mesh_obj.faces),
                'validation_errors': None,
            }
            
        except Exception as e:
            logger.error(f"Error analyzing STL file: {str(e)}")
            return {
                'is_valid': False,
                'validation_errors': str(e),
                'volume': None,
                'surface_area': None,
                'bounding_box_x': None,
                'bounding_box_y': None,
                'bounding_box_z': None,
                'weight': None,
            }


class CADAnalyzer:
    """Analyzer for CAD files (STEP, IGES)"""
    
    @staticmethod
    def analyze(file_path):
        """
        Analyze CAD files using trimesh or CAD libraries
        Note: For production, use pythonOCC or CADQuery
        """
        try:
            # Try loading with trimesh (supports some CAD formats)
            mesh_obj = trimesh.load(file_path)
            
            if isinstance(mesh_obj, trimesh.Scene):
                meshes = [g for g in mesh_obj.geometry.values() if isinstance(g, trimesh.Trimesh)]
                if meshes:
                    mesh_obj = trimesh.util.concatenate(meshes)
            
            # Same calculations as STL
            volume_cm3 = abs(mesh_obj.volume) / 1000 if hasattr(mesh_obj, 'volume') and mesh_obj.volume else 0
            surface_area_cm2 = mesh_obj.area / 100 if hasattr(mesh_obj, 'area') and mesh_obj.area else 0
            
            bounds = mesh_obj.bounds
            if bounds is not None:
                bbox_x = bounds[1][0] - bounds[0][0]
                bbox_y = bounds[1][1] - bounds[0][1]
                bbox_z = bounds[1][2] - bounds[0][2]
            else:
                bbox_x = bbox_y = bbox_z = 0
            
            density_pla = 1.24
            weight_grams = volume_cm3 * density_pla
            
            return {
                'is_valid': True,
                'volume': round(volume_cm3, 3),
                'surface_area': round(surface_area_cm2, 3),
                'bounding_box_x': round(bbox_x, 2),
                'bounding_box_y': round(bbox_y, 2),
                'bounding_box_z': round(bbox_z, 2),
                'weight': round(weight_grams, 2),
                'validation_errors': None,
            }
            
        except Exception as e:
            logger.error(f"Error analyzing CAD file: {str(e)}")
            return {
                'is_valid': False,
                'validation_errors': f"CAD analysis error: {str(e)}",
                'volume': None,
                'surface_area': None,
                'bounding_box_x': None,
                'bounding_box_y': None,
                'bounding_box_z': None,
                'weight': None,
            }


def analyze_file(file_path, file_extension):
    """
    Main function to analyze uploaded files
    Supports: STL, OBJ, STEP, IGES
    """
    ext = file_extension.lower().strip('.')
    
    if ext in ['stl', 'obj']:
        return STLAnalyzer.analyze(file_path)
    elif ext in ['step', 'stp', 'iges', 'igs']:
        return CADAnalyzer.analyze(file_path)
    else:
        return {
            'is_valid': False,
            'validation_errors': f"Unsupported file format: {ext}",
            'volume': None,
            'surface_area': None,
            'bounding_box_x': None,
            'bounding_box_y': None,
            'bounding_box_z': None,
            'weight': None,
        }