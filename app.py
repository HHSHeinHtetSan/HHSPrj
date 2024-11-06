# TODO: expire the sessions.

import os

# op --> hash
# np --> l(np, op) --> if pass np --> hash
# op --> hash
# TODO: learn more about Levenshtein about salting and seeding and how the hashing works.

import Levenshtein

from functools import wraps
from flask import Flask, request, render_template, jsonify, redirect, session, url_for
from cs50 import SQL
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

# Configure Application
app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 library to use SQLite database
db = SQL("sqlite:///final.db")

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def index():
    user_id = session["user_id"]
    data = db.execute("SELECT game1_score, game2_score FROM scores WHERE user_id=?", user_id)

    # TODO: how to check there's no db errors and is this the real result?
    # TODO: need to add exception
    if data:
        #### here's the bug
        data = data[0]  # Get the data
    else:
        data = {"game1_score": None, "game2_score": None}  # Default
    print(data)
    return render_template("index.html", data=data)

@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""
    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method != "POST":
        return render_template("login.html")
    else:
        # Ensure username was submitted
        if not request.form.get("username"):
            return jsonify({"error": "All fields are required!"})

        # Ensure password was submitted
        elif not request.form.get("password"):
            return jsonify({"error": "Password is required!"})

        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username")
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], request.form.get("password")
        ):
            return jsonify({"error": "Invalid username or password!"})

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

@login_required
@app.route("/logout")
def logout():
    """Log user out"""
    session.clear()
    return redirect("/")

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method != 'POST':
        return render_template("register.html")
    else:
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        # TODO: input validation
        if not username or not password or not confirmation:
            return jsonify({"error": "All fields are required!"})
        elif password != confirmation:
            return jsonify({"error": "Passwords need to match!"})
        else:
            is_valid, message = password_check(password)
            color = "green" if is_valid else "red"
            if is_valid:
                message = "Password is strong enough"
            hash = generate_password_hash(password)
            try:
                db.execute(
                    "INSERT INTO users (username, hash) VALUES (?, ?)",
                    username, hash
                )
                user_id = db.execute("SELECT last_insert_rowid()")[0]["last_insert_rowid()"]
                # I create a query of gamescores for the newly registered user
                db.execute(
                    "INSERT INTO old_passwords (user_id, password) VALUES (?, ?)", 
                    user_id, password
                )
                return jsonify({"success": "User registered successfully!"})
            except ValueError:
                return jsonify({"error": "Username already exists. Please choose a different username."})

def password_check(password):
    SpecialSym = ['$', '@', '#', '%']
    val = True
    message = ""

    if len(password) < 6:
        message = "Length should be at least 6"
        val = False

    if len(password) > 20:
        message = "Length should not be greater than 20"
        val = False

    if not any(char.isdigit() for char in password):
        message = "Password should have at least one numeral"
        val = False

    if not any(char.isupper() for char in password):
        message = "Password should have at least one uppercase letter"
        val = False

    if not any(char.islower() for char in password):
        message = "Password should have at least one lowercase letter"
        val = False

    if not any(char in SpecialSym for char in password):
        message = "Password should have at least one of the symbols $@#%"
        val = False

    return val, message

@app.route('/check', methods=['POST'])
def check_password():
    password = request.form.get("password")
    is_valid, message = password_check(password)

    color = "green" if is_valid else "red"
    if is_valid:
        message = "Password is Valid"
    return render_template("password.html", message=message, color=color)

@app.route("/game1", methods=["GET", "POST"])
@login_required
def game1fun():
    if request.method == "GET":
        return render_template("game1.html")

    if request.method == "POST":
        answer = request.form.get("answer")
        user_id = session["user_id"]        

        # when user confirm 
        # find if there's already a row
            # update that if there is
            # insert a new row if there's not
        # which path make that response

        # inspect -> network tab -> game sok -> which endpoints are used.
        # path hti htr dr phyit lout

        # check if player has previous score
        # TODO: handle exceptions
        print(f"userid : {user_id}")
        rows = db.execute("SELECT * FROM Assets WHERE user_id=?", user_id)
        print("Here is the existing data:",rows)
        # If no previous records exist, I need to set a row for this
        print(f"check if there are rows{len(rows)}")
        if len(rows) == 0:
            db.execute (
                "INSERT INTO Assets (user_id, correct_score, incorrect_score) VALUES (?, ?, ?)",
                user_id, 0, 0
            )

        # I do the operations about the correct and incorrect answers now
        # but I don't really need to show jsonify as it already existed on the back of my card

        if answer == "correct":
            # SQL process for correct answer
            print("found the correct")
            db.execute("UPDATE Assets SET correct_score = correct_score + 1 WHERE user_id=?", user_id)
            print("correct score is updated by 1")
        else:
            # SQL process for incorrect answer
            # why it keeps executing every answer as incorrect after the first was incorrect?
            # Quite suspicious?
            print("found the incorrect")
            db.execute("UPDATE Assets SET incorrect_score = incorrect_score + 1 WHERE user_id=?", user_id)
            print("incorrect score is updated by 1")

        # Return an default redirecting page
        # In this case,I need to find a way to repeat the slide process until I clicked the final button about showing result.
        return jsonify(success = "Data saved successfully!")

@app.route('/game2', methods=["GET"])
@login_required
def game2fun():
    # user_id = session["user_id"]
    if request.method == "GET":
        return render_template("game2.html")

@app.route("/check_answer_game2", methods=["POST"])
@login_required
def checkAnswerGame2():
    user_id = session["user_id"]
    data = request.get_json()

    # NEED TO USE TRY EXCEPT FOR EXCEPTION HANDLING.
    # Convert to int, remove 'slide' prefix if present
    slide_id = int(data.get("slide_id").replace("slide", ""))  
    answers = data.get("answers", {})  # Expecting a dictionary with blank_id as keys

    if not slide_id or not answers:
        return jsonify({"Error": "Slide Id and Answers are required"}), 400
    
    correct_answers = {}
    for blank_id, user_answer in answers.items():
        # Fetch the correct answer from the database for each blank
        correct_answer_row = db.execute(
            "SELECT answer FROM Answers WHERE slide_id = ? AND blank_id = ?", slide_id, blank_id
        )
        correct_answer = correct_answer_row[0]["answer"] if correct_answer_row else None
        print(
            f"User answer for blank {blank_id}: '{user_answer}', Correct answer from DB: '{correct_answer}'")

        # Compare the user's answer with the correct answer
        if correct_answer:
            correct_answers[blank_id] = user_answer.lower(
            ).strip() == correct_answer.lower().strip()
        else:
            correct_answers[blank_id] = False  # Mark as incorrect if no correct answer found

    all_correct = all(correct_answers.values())
    return jsonify({"correct_answers": correct_answers, "all_correct": all_correct})


@app.route("/save_marks", methods=["POST"])
@login_required
def save_mark():
    user_id = session["user_id"]
    data = request.get_json()
    
    try:
        # Extract and convert slide number
        slide_number = int(data.get("slideId").replace("slide", ""))
        
        # Get mark values and convert to integers
        correctMark = int(data.get("correctMark"))
        incorrectMark = int(data.get("incorrectMark"))
        
        print(user_id, slide_number, correctMark, incorrectMark)
        
        # Validate data
        if slide_number is None or correctMark is None or incorrectMark is None:
            return jsonify({"error": "Slide ID, correct mark, and incorrect mark are required"}), 400
        
        # Insert into database
        db.execute(
            """INSERT INTO SlideScores 
            (user_id, slide_id, correct_mark, incorrect_mark)
            VALUES (?, ?, ?, ?);
            """,
            user_id, slide_number, correctMark, incorrectMark
        )
        
        print("this worked.")
        return jsonify({"message": "Mark saved successfully"}), 200
        
    except ValueError as e:
        print(f"Error converting values: {e}")
        return jsonify({"error": "Invalid numeric values provided"}), 400
    except Exception as e:
        print(f"Error inserting into database: {e}")
        return jsonify({"error": "An error occurred while saving the mark"}), 500

# Here I will create a function to obtain data from the db and use it to apply in the pie_chart

@app.route('/scores1')
@login_required
def scores1():
    user_id = session["user_id"]
    data = db.execute(
            "SELECT user_id, correct_score, incorrect_score FROM Assets WHERE user_id=?", user_id
            )
    return render_template('scores1.html', data=data,user_id=user_id)

@app.route('/scores2')
@login_required
def scores2():
    user_id = session["user_id"]
    data = db.execute("SELECT slide_id, correct_mark, incorrect_mark FROM SlideScores WHERE user_id=? ORDER BY timestamp DESC", user_id)
    
    # scores = get_scores2(user_id)

    return render_template('scores2.html', data=data, user_id=user_id)

@app.route("/return_scores1")
@login_required
def scoreReturn1():
    # Fetch user_id from session or login manager
    user_id = session["user_id"]

    print("score1 path found and py code running!")
    # Extract correct_score from Assets table
    # TODO: catch some exceptions
    correct_score = db.execute(
        "SELECT correct_score FROM Assets WHERE user_id = ?", user_id)
    # TODO: do we have to use like that or is not None?
    if correct_score:
        correct_score = correct_score[0]['correct_score']
        print(f"value of correct score in scoresReturn is {correct_score}")
    else:
        correct_score = 0
        print(f"value of correct score in scoresReturn is 0")
    # Check if the user already has a score
    existing_score = db.execute("SELECT * FROM scores WHERE user_id = ?", user_id)

    if existing_score:
        # Update the existing score
        db.execute(
            "UPDATE scores SET game1_score = ? WHERE user_id = ?",
            correct_score, user_id
        )
    else:
        # Insert a new score
        db.execute(
            "INSERT INTO scores (user_id, game1_score) VALUES (?, ?)",
            user_id, correct_score
        )

    # Delete scores from Assets table after transferring
    db.execute("DELETE FROM Assets WHERE user_id = ?", user_id)

        # Redirect to index.html
    return redirect("/")

@app.route("/return_scores2")
@login_required
def scoreReturn2():
    # Fetch user_id from session or login manager
    user_id = session["user_id"]

    print("score1 path found and py code running!")

    # Sum all correct scores for the given user_id across all slides
    total_correct_score = db.execute(
        "SELECT SUM(correct_mark) AS total_correct FROM SlideScores WHERE user_id = ?", (user_id,)
    )[0]["total_correct"]

    # Insert the summed score into the Scores table for the current user
    db.execute(
        "INSERT INTO Scores (user_id, game2_score) VALUES (?, ?)",
        user_id, total_correct_score
    )

    # Delete the user's scores from the Assets table after transferring them
    db.execute("DELETE FROM SlideScores WHERE user_id = ?", (user_id,))

    # Redirect to index.html
    return render_template("index.html")




@app.route("/check_answer", methods=["POST"])
@login_required
def checkAnswer():
    user_id = session["user_id"]

    # Retrieve the JSON data from the request body
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data received"}), 400
    
    # Extract the slide name and answer from the JSON payload
    slide_name = data.get("slideName")
    answer = data.get("answer")

    # Retrieve the session cookie from the request headers
    session_cookie = request.headers.get('session')
    if not session_cookie:
        return jsonify({"error": "Session cookie not provided"}), 401

    # Check your answer here.
    # process the anser.
    # correct boolean
    # default value
    correct = False

    # For demonstration purposes, we'll just return them with a success message
    response = {
        "message": "Answer checked successfully",
        "correct": correct
    }
    return jsonify(response), 200

@app.route("/changepass", methods=["GET", "POST"])
@login_required
def changepass():
    user_id = session["user_id"]

    if request.method == "GET":
        return render_template("pass_change.html")

    if request.method == "POST":
        current_password = request.form.get("current_password")
        new_password_a = request.form.get("new_password_a")
        new_password_b = request.form.get("confirmation")

        # Check if fields are filled
        if not current_password or not new_password_a or not new_password_b:
            return jsonify({"error": "All fields are required!"}), 400

        # Get the hash of the current password from the database
        original_hash = db.execute("SELECT hash FROM users WHERE id=?", user_id)

        # Validate the current password
        if not check_password_hash(original_hash[0]["hash"], current_password):
            return jsonify({"error": "Incorrect current password!"}), 400

        # Check if new password and confirmation match
        if new_password_a != new_password_b:
            return jsonify({"error": "Passwords do not match!"}), 400

        # Check password strength (using your password_check function)
        is_valid, message = password_check(new_password_a)
        if not is_valid:
            return jsonify({"error": message}), 400

        # check if the new password is similar to old ones
        if check_oldpw(new_password_a):
            # Insert changed password into old_passwords table.
            db.execute("INSERT INTO old_passwords (user_id, password) VALUES (?,?)", user_id, new_password_a)
        else:
             return jsonify({"error": "New password is too similar to previous ones."}), 400
        # Generate hash for the new password
        final_hash = generate_password_hash(new_password_a)

        # Update the new password in the database
        db.execute("UPDATE users SET hash=? WHERE id=?", final_hash, user_id)
        return redirect("/login")

def check_oldpw(new_password):
    # get the currently logged in user_id
    user_id = session["user_id"]
    # then try to get the old_passwords stored under this user_id
    threshold = 3
    val = True
    rows = db.execute("SELECT password FROM old_passwords WHERE user_id = ?", user_id)
    for row in rows:
        distance = Levenshtein.distance(new_password, row["password"])
        if distance < threshold:
            return False
        else:
            return True


if __name__ == '__main__':
    app.run(debug=True)


