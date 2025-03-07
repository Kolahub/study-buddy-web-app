from flask import jsonify, request
import os
import json
import requests
from werkzeug.utils import secure_filename
from . import app

# Mock storage for uploaded files
UPLOAD_FOLDER = '/tmp/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/slides/upload', methods=['POST'])
def upload_slide():
    try:
        # Check if file part exists
        if 'file' not in request.files:
            return jsonify({
                "status": "error",
                "message": "No file part"
            }), 400
            
        file = request.files['file']
        
        # If user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return jsonify({
                "status": "error",
                "message": "No file selected"
            }), 400
            
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        course_id = request.form.get('courseId', '')
        
        if not title:
            return jsonify({
                "status": "error",
                "message": "Title is required"
            }), 400
            
        if not course_id:
            return jsonify({
                "status": "error",
                "message": "Course ID is required"
            }), 400
            
        # Generate a secure filename
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        # Validate file type
        allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif']
        if file_ext not in allowed_extensions:
            return jsonify({
                "status": "error",
                "message": f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            }), 400
            
        # Generate a unique filename to avoid collisions
        unique_filename = f"{course_id}_{int(os.path.getmtime('/tmp'))}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save the file
        file.save(file_path)
        
        # In a real implementation, you would store file metadata in a database
        # and upload the file to a cloud storage service
        
        # Mock response with file URL (in a real app, this would be a cloud storage URL)
        file_url = f"/uploads/{unique_filename}"
        
        # Return success response
        return jsonify({
            "status": "success",
            "message": "File uploaded successfully",
            "fileUrl": file_url,
            "filePath": file_path,
            "metadata": {
                "title": title,
                "description": description,
                "courseId": course_id,
                "fileName": filename,
                "fileType": file.content_type,
                "fileSize": os.path.getsize(file_path)
            }
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500 