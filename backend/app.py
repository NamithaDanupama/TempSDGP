import os

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

from visualSearchBackend.services.config import get_config
from visualSearchBackend.services.gemini_service import init_gemini
from visualSearchBackend.routes import api_bp

def create_app():

    app = Flask(__name__)

    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    
    # 3. Universal API Key Bridge (Keeps AI working for all features)
    api_key = os.getenv('VITE_GEMINI_API_KEY') or os.getenv('GEMINI_API_KEY')
    if api_key:
        app.config['GEMINI_API_KEY'] = api_key
        os.environ['GEMINI_API_KEY'] = api_key
        os.environ['VITE_GEMINI_API_KEY'] = api_key
    else:
        print("No Gemini API Key found in .env!")

    config_obj = get_config()
    app.config.from_object(config_obj)

    from lessonPlanBackend import lessons_bp
    from reinforcedLearningBackend  import mochi_bp
    from revisionGamesBackend.routes import revision_games_bp

    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(lessons_bp)
    app.register_blueprint(mochi_bp)
    app.register_blueprint(revision_games_bp, url_prefix='/api/revision')

    # from quizzes import quizzes_bp
    # app.register_blueprint(quizzes_bp)
    with app.app_context():
    # This ensures init_gemini can use current_app.config['GEMINI_API_KEY']
        try:
            init_gemini()
        except Exception as e:
            print(f"Error initializing Gemini: {e}")
            

    return app

if __name__ == '__main__':
    app = create_app()
    print("Starting main Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
