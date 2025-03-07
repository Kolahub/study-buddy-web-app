from flask import request, jsonify
import os
from . import app

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "API is running"
    })

# Add your existing API endpoints here
# Example endpoint:
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        # Add your chat logic here
        return jsonify({
            "status": "success",
            "message": "Message received",
            "data": data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# Import all API modules to register their routes
try:
    # These imports are just to register the routes
    from . import quizzes
    from . import slides
except ImportError as e:
    print(f"Warning: Could not import some API modules: {e}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000))) 