# backend/manufacturing_app/settings.py
import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-your-secret-key-here-change-in-production'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    
    # Local apps
    'accounts',
    'quotes',
    'orders',
    'pricing',
    'files',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'manufacturing_app.urls'

# ⭐ TEMPLATES CONFIGURATION (THIS WAS MISSING)
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'manufacturing_app.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (Uploads)
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# Also add to ALLOWED_HOSTS if needed
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Pricing Configuration
PRICING_CONFIG = {
    '3D_PRINTING': {
        'PLA': {
            'material_cost_per_gram': 850,      # Rp 850/gram (~€0.05)
            'machine_cost_per_hour': 34000,      # Rp 34,000/hour (~€2)
            'setup_fee': 17000,                  # Rp 17,000 (~€1)
        },
        'ABS': {
            'material_cost_per_gram': 1020,      # Rp 1,020/gram
            'machine_cost_per_hour': 42500,      # Rp 42,500/hour
            'setup_fee': 25500,                  # Rp 25,500
        },
        'PETG': {
            'material_cost_per_gram': 1190,      # Rp 1,190/gram
            'machine_cost_per_hour': 42500,
            'setup_fee': 25500,
        },
        'NYLON': {
            'material_cost_per_gram': 2550,      # Rp 2,550/gram (premium)
            'machine_cost_per_hour': 51000,
            'setup_fee': 34000,
        },
        'TPU': {
            'material_cost_per_gram': 1700,
            'machine_cost_per_hour': 42500,
            'setup_fee': 25500,
        },
    },
    'CNC_MACHINING': {
        'ALUMINUM': {
            'material_cost_per_cm3': 1700,       # Rp 1,700/cm³
            'machine_cost_per_hour': 255000,     # Rp 255,000/hour (~€15)
            'setup_fee': 170000,                 # Rp 170,000 (~€10)
        },
        'STEEL': {
            'material_cost_per_cm3': 1360,       # Rp 1,360/cm³
            'machine_cost_per_hour': 306000,     # Rp 306,000/hour
            'setup_fee': 204000,                 # Rp 204,000
        },
        'BRASS': {
            'material_cost_per_cm3': 3400,
            'machine_cost_per_hour': 306000,
            'setup_fee': 204000,
        },
        'POM_DELRIN': {
            'material_cost_per_cm3': 850,
            'machine_cost_per_hour': 204000,
            'setup_fee': 136000,
        },
    },
    'LASER_CUTTING': {
        'ACRYLIC_3MM': {
            'material_cost_per_cm2': 340,        # Rp 340/cm²
            'machine_cost_per_minute': 1700,     # Rp 1,700/minute (~€0.10)
            'setup_fee': 34000,                  # Rp 34,000
        },
        'ACRYLIC_5MM': {
            'material_cost_per_cm2': 510,
            'machine_cost_per_minute': 2550,
            'setup_fee': 34000,
        },
        'WOOD_MDF_3MM': {
            'material_cost_per_cm2': 170,
            'machine_cost_per_minute': 1360,
            'setup_fee': 25500,
        },
        'WOOD_PLYWOOD_5MM': {
            'material_cost_per_cm2': 255,
            'machine_cost_per_minute': 1700,
            'setup_fee': 25500,
        },
        'STAINLESS_1MM': {
            'material_cost_per_cm2': 850,
            'machine_cost_per_minute': 4250,
            'setup_fee': 51000,
        },
    },
}

# Default print settings
PRINT_SETTINGS = {
    'layer_height': 0.2,  # mm
    'infill_percentage': 20,
    'print_speed': 50,  # mm/s
    'support_material': False,
}

# Currency settings
CURRENCY_SETTINGS = {
    'code': 'IDR',
    'symbol': 'Rp',
    'symbol_position': 'before',  # 'before' = "Rp 10.000", 'after' = "10.000 Rp"
    'decimal_places': 0,  # IDR typically has no decimals
    'thousands_separator': '.',  # Indonesian format: 1.000.000
    'decimal_separator': ',',  # Indonesian format: 1.000,50 (if decimals used)
}