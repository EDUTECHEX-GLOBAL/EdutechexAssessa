from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
import json
from dotenv import load_dotenv
from typing import List

load_dotenv()

# === AWS Bedrock Clients ===
bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

app = FastAPI()

# === CORS Setup ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Pydantic Schemas ===
class ChatRequest(BaseModel):
    message: str
    history: List[str] = []

class AssessmentRequest(BaseModel):
    topic: str
    grade: int
    subject: str
    curriculum: str
    num_questions: int = 5

class EvaluationRequest(BaseModel):
    question: str
    selected_option: str
    correct_option: str

class ScoreRequest(BaseModel):
    answers: dict
    correctAnswers: dict

# === Call Mistral Model ===
def call_mistral(messages: List[dict]):
    try:
        prompt_texts = " ".join([msg["content"][0]["text"] for msg in messages])
        prompt = f"<s>[INST] {prompt_texts} [/INST]"

        body = {
            "prompt": prompt,
            "max_tokens": 3000,
            "temperature": 0.5,
            "top_p": 0.9,
            "top_k": 50
        }

        model_id = "mistral.mistral-large-2402-v1:0"

        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )

        raw_body = response["body"].read().decode("utf-8")
        response_body = json.loads(raw_body)

        if "outputs" in response_body:
            return response_body["outputs"][0].get("text", "").strip()
        elif "completion" in response_body:
            return response_body["completion"].strip()
        elif "output" in response_body:
            return response_body["output"].strip()
        else:
            print("Unknown response structure:", response_body)
            return "No valid output found in response."

    except Exception as e:
        print(f"Error while calling Mistral model: {e}")
        return "Error occurred during model call."

# === Call Claude Model ===
def call_claude(prompt: str):
    try:
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4096,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        }

        model_id = "anthropic.claude-3-5-sonnet-20240620-v1:0"

        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )

        raw_body = response["body"].read().decode("utf-8")
        response_body = json.loads(raw_body)

        if "content" in response_body:
            for c in response_body["content"]:
                if c.get("type") == "text":
                    return c.get("text", "").strip()
            return "No text content found in response."
        elif "outputs" in response_body:
            return response_body["outputs"][0].get("text", "").strip()
        elif "completion" in response_body:
            return response_body["completion"].strip()
        elif "output" in response_body:
            return response_body["output"].strip()
        else:
            print("Unknown Claude response structure:", response_body)
            return "No valid output found from Claude."

    except Exception as e:
        print(f"Error while calling Claude model: {e}")
        return "Error occurred during Claude model call."

# === Intent Detection ===
def detect_intent(message: str) -> str:
    message_lower = message.lower()
    if "generate" in message_lower and ("question" in message_lower or "quiz" in message_lower or "assessment" in message_lower):
        return "generate-assessment"
    elif "answer" in message_lower and ("is correct" in message_lower or "check" in message_lower or "evaluate" in message_lower):
        return "evaluate-answer"
    else:
        return "chat"

# === Routes ===

@app.post("/chat")
async def smart_chat(req: ChatRequest):
    intent = detect_intent(req.message)

    if intent == "generate-assessment":
        prompt = f"Create 5 MCQs on this topic: '{req.message}'. Each with 4 options and mark the correct one."
        messages = [{"role": "user", "content": [{"type": "text", "text": prompt}]}]
        response = call_mistral(messages)
        return {"type": "assessment", "response": response}

    elif intent == "evaluate-answer":
        return {
            "type": "evaluation",
            "response": "Please use /evaluate-answer endpoint for structured evaluation."
        }

    else:  # Default Chat
        all_history = [{"role": "user", "content": [{"type": "text", "text": msg}]} for msg in req.history]
        all_history.append({"role": "user", "content": [{"type": "text", "text": req.message}]})

        response = call_mistral(all_history)
        return {"type": "chat", "response": response}

@app.post("/generate-assessment")
async def generate_assessment(req: AssessmentRequest):
    prompt = (
        f"Create {req.num_questions} multiple-choice questions for a {req.curriculum} Grade {req.grade} student "
        f"in {req.subject} on the topic '{req.topic}'. Each question must follow these rules:\n\n"
        f"1. Return only valid JSON format (no additional text before or after)\n"
        f"2. Each question must have exactly 4 options (A, B, C, D)\n"
        f"3. The answer must be one of the option letters (A, B, C, or D)\n"
        f"4. Format each question exactly like this example:\n\n"
        f"{{\n"
        f"  \"question\": \"What is the capital of France?\",\n"
        f"  \"options\": [\"London\", \"Berlin\", \"Paris\", \"Madrid\"],\n"
        f"  \"answer\": \"C\"\n"
        f"}}\n\n"
        f"Return the complete JSON array of questions without any additional commentary or formatting.\n"
        f"Here's the required output format:\n"
        f"[{{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"answer\": \"A\"}}, ...]"
    )

    try:
        response = call_claude(prompt)
        
        # Try to parse the response to validate it's proper JSON
        parsed = json.loads(response)
        
        # If parsing succeeds, return the cleaned response
        return {"questions": parsed}
    except json.JSONDecodeError as e:
        print(f"Failed to parse generated questions: {e}")
        # If parsing fails, try to extract JSON from the response
        try:
            # Try to find JSON in the response
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                parsed = json.loads(json_str)
                return {"questions": parsed}
        except Exception as e:
            print(f"Failed to extract JSON from response: {e}")
        
        # If all else fails, return an error structure
        return {
            "error": "Failed to generate valid JSON format questions",
            "raw_response": response,
            "questions": [{
    "question": "Error: Could not generate questions in required format",
    "options": ["Check the topic and try again", "Contact support", "Try a different topic", "Verify your input"],
    "answer": "A"
}]

        }

@app.post("/evaluate-score")
async def evaluate_score(req: ScoreRequest):
    answers = req.answers
    correct_answers = req.correctAnswers

    if not answers or not correct_answers:
        return {"success": False, "error": "Answers and correct answers are required!"}

    score = 0
    for key in correct_answers:
        try:
            user_answer = int(answers.get(key, -1))
            correct_answer = int(correct_answers[key])
            if user_answer == correct_answer:
                score += 1
        except (ValueError, TypeError):
            continue

    total_questions = len(correct_answers)

    return {
        "success": True,
        "score": score,
        "totalQuestions": total_questions,
        "message": f"You scored {score} out of {total_questions}."
    }
