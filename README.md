# Super App for Barakah Economy Society
A step-by-step guide to build a crowdfunding website using Django and React, based on the layout shown in the reference images.
Building a Crowdfunding Platform with Django and React


# Step 1: Project Setup 
## Backend (Django)
### Create virtual environment
    python -m venv .venv
    
#### On Linux: 
    source .venv/bin/activate  
#### On Windows: 
    .venv\Scripts\activate

### Install dependencies
    pip install django djangorestframework django-cors-headers Pillow

### Start project
    django-admin startproject manufacturing_app
    cd manufacturing_app

### Create apps
    python manage.py startapp accounts
    python manage.py startapp quotes
    python manage.py startapp orders
    python manage.py startapp pricing
    python manage.py startapp files


## Frontend (React)
### Create React app
    cd ../frontend
    npx create-react-app .
    npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
    npm install three @react-three/fiber @react-three/drei
    npm install react-dropzone filepond react-filepond filepond-plugin-image-preview
    npm install recharts  # For charts
    npm install formik yup  # For forms
