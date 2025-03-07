from flask import jsonify, request
import os
import json
import requests
from .index import app

@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    try:
        # In a real implementation, you would fetch quizzes from your database
        # For now, return mock data that matches your frontend expectations
        quizzes = [
            {
                "id": "1",
                "title": "Object-Oriented Programming Basics",
                "description": "Test your knowledge of OOP fundamentals",
                "time_limit": 15,
                "question_count": 10,
                "created_at": "2023-06-15T10:00:00Z"
            },
            {
                "id": "2",
                "title": "Python Data Structures",
                "description": "Quiz on Python lists, dictionaries, and more",
                "time_limit": 20,
                "question_count": 15,
                "created_at": "2023-06-10T14:30:00Z"
            },
            {
                "id": "3",
                "title": "Web Development Fundamentals",
                "description": "HTML, CSS, and JavaScript basics",
                "time_limit": 25,
                "question_count": 20,
                "created_at": "2023-06-05T09:15:00Z"
            }
        ]
        
        return jsonify(quizzes)
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/quizzes/<quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    try:
        # In a real implementation, you would fetch the specific quiz from your database
        # For now, return mock data
        quiz = {
            "id": quiz_id,
            "title": "Object-Oriented Programming Basics" if quiz_id == "1" else "Python Quiz",
            "description": "Test your knowledge of OOP fundamentals",
            "time_limit": 15,
            "question_count": 5,
            "questions": [
                {
                    "id": "q1",
                    "text": "What does OOP stand for?",
                    "options": [
                        "Object-Oriented Programming",
                        "Outcome-Oriented Protocol",
                        "Object-Oriented Protocol",
                        "Outcome-Oriented Programming"
                    ],
                    "correct_option": 0
                },
                {
                    "id": "q2",
                    "text": "Which of the following is a pillar of OOP?",
                    "options": [
                        "Fragmentation",
                        "Encapsulation",
                        "Segregation",
                        "Compilation"
                    ],
                    "correct_option": 1
                },
                {
                    "id": "q3",
                    "text": "What is inheritance in OOP?",
                    "options": [
                        "A way to create multiple instances of a class",
                        "A mechanism to reuse code from one class in another",
                        "A method to hide data from external access",
                        "A technique to compile code faster"
                    ],
                    "correct_option": 1
                },
                {
                    "id": "q4",
                    "text": "What is polymorphism?",
                    "options": [
                        "The ability to create multiple classes",
                        "The ability to create multiple objects",
                        "The ability to take on multiple forms",
                        "The ability to inherit from multiple classes"
                    ],
                    "correct_option": 2
                },
                {
                    "id": "q5",
                    "text": "Which of these is NOT an access modifier in most OOP languages?",
                    "options": [
                        "Public",
                        "Private",
                        "Protected",
                        "Common"
                    ],
                    "correct_option": 3
                }
            ]
        }
        
        return jsonify(quiz)
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/quizzes/generate', methods=['POST'])
def generate_quiz():
    try:
        data = request.get_json()
        content_id = data.get('contentId')
        
        if not content_id:
            return jsonify({
                "status": "error",
                "message": "Content ID is required"
            }), 400
            
        # In a real implementation, you would generate a quiz based on the content
        # For now, return a mock generated quiz
        generated_quiz = {
            "id": "gen-" + content_id,
            "title": "Generated Quiz for Content " + content_id,
            "description": "Quiz generated from your content",
            "time_limit": 10,
            "question_count": 5,
            "created_at": "2023-07-01T12:00:00Z"
        }
        
        return jsonify({
            "status": "success",
            "message": "Quiz generated successfully",
            "quiz": generated_quiz
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500 