from flask import Flask
from flask_cors import CORS
from app.models import db
from app.routes.training import training_bp

def create_app(config=None):
    app = Flask(__name__)
    
    if config is None:
        config = {
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///training.db',
            'SQLALCHEMY_TRACK_MODIFICATIONS': False,
            'SECRET_KEY': 'dev-secret-key-change-in-production'
        }
    
    app.config.update(config)
    
    CORS(app)
    
    db.init_app(app)
    
    app.register_blueprint(training_bp)
    
    with app.app_context():
        db.create_all()
    
    return app
