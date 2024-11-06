// Wrap everything inside a single DOMContentLoaded listener
console.log("Javascript is loaded");
document.addEventListener('DOMContentLoaded', function() {
    // **FORM SUBMISSION HANDLER**
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {  // Check if the form exists on this page
        registerForm.onsubmit = async function(event) {
            event.preventDefault();  // Prevent the default form submission behavior

            const formData = new FormData(this);  // Collect form data
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();  // Parse JSON from response
                const notification = document.getElementById('notification');

                // Check if 'notification' element exists
                if (notification) {
                    if (result.error) {
                        notification.innerText = result.error;
                        notification.style.color = 'red';
                    } else {
                        notification.innerText = result.success;
                        notification.style.color = 'green';
                    }
                }
            } catch (error) {
                console.error('Error during form submission:', error);
                // Optionally, display an error message in the UI
            }
        };
    }
    //** Here is the ticked function to choose the answer and submit it */
    /* I need to add more implementation about flipping the card before it is redirected */
   /* card2 = document.getElementById("card2");
    checkbox2 = document.getElementById("checkbox2")
    card2.addEventListener("click", function() {
        if (document.getElementById('checkbox1').checked) {
            console.log("america is chosen.")
            checkbox2.checked = false;
        } else {
            console.log("america is removed.")
            checkbox2.checked = true;
        }
    }) */

    const confirmBtn = document.getElementById('confirm1');
    const answerInput = document.querySelector('input[name="answer"]');
    if (confirmBtn) {

    confirmBtn.addEventListener('click', function (event) {
        event.preventDefault();  // Prevent the form submission

        // here checking the answer
        // checkAnswer("somethingSlide", "somethingAnswer")

        let flipTimeout = 0;
        let slideNum = currentSlide + 1;
        // Debugging for slideNum
        console.log(document.querySelector(`.card-variant-1_slide${slideNum}`));
        console.log(document.querySelector(`.card-variant-2_slide${slideNum}`));
        console.log("Current Slide is:", slideNum);
        // Debugging for new slide condition
        console.log("Checkbox1 State:", document.querySelector(`.card-variant-1_slide${slideNum}`));
        console.log("Checkbox2 State:", document.querySelector(`.card-variant-2_slide${slideNum}`));

        if (document.getElementById(`checkbox1_slide${slideNum}`).checked) {
            document.querySelector(`.card-variant-1_slide${slideNum}`).classList.toggle('flipped');
            flipTimeout = 1500;
            answerInput.value = "correct";
            console.log("Correct was chosen"); // Debugging
        }
        else if (document.getElementById(`checkbox2_slide${slideNum}`).checked) {
            document.querySelector(`.card-variant-2_slide${slideNum}`).classList.toggle('flipped');
            flipTimeout = 1500;
            answerInput.value = "incorrect";
            console.log("Incorrect was chosen"); // Debugging
        }
        confirmBtn.disabled = true;
    
        setTimeout(() => {
            const formData = new FormData(document.querySelector('form'));
            console.log("here is the form data", formData); // Debugging

            fetch('/game1', {
                method: 'POST',
                // NOTED HERE, you will need to check it again
                body: formData
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert(result.success);
                } else if (result.error) {
                    alert(result.error);
                }
            })
            .catch(error => console.error('Error:', error));
        }, flipTimeout);
    });
    } else {
        console.warn("ConfirmBtn1 not found. Skipped");
    }

// **GAME2 CHECK ANSWERS FUNCTION WITH MARK TRACKING AND BACKEND LINK**
function checkAnswerGame2(slideId) {
    // Avoid processing slide zero
    if (slideId === "slide0") {
        console.warn("Skipping slide zero");
        return;
    }

    const blanks = document.querySelectorAll(`#${slideId} input[type="text"]`);
    let correctMark = 0;
    let incorrectMark = 0;
    const answers = {}; // Store user answers

    blanks.forEach(blank => {
        const blankId = blank.id.match(/blank(\d+)_slide\d+/)[1];
        const userAnswer = blank.value.trim();
        answers[blankId] = userAnswer;
    });

    // Debugging output to track answers sent to server
    console.log("Sending answers to server:", answers);

    // Send the slideId, answers to the backend to validate and calculate marks
    fetch('/check_answer_game2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slide_id: slideId, answers: answers }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle server response and mark correctness
        const correctAnswers = data.correct_answers;
        
        blanks.forEach(blank => {
            const blankId = blank.id.match(/blank(\d+)_slide\d+/)[1];
            if (correctAnswers[blankId]) {
                correctMark++;
                blank.style.borderColor = "green";  // Indicate correct
            } else {
                incorrectMark++;
                blank.style.borderColor = "red";  // Indicate incorrect
            }
        });

        console.log("Total Correct Marks:", correctMark);
        console.log("Total Incorrect Marks:", incorrectMark);

        // Optionally, send the marks to the backend for tracking
        saveMarks(slideId, correctMark, incorrectMark);
    })
    .catch(error => console.error('Error:', error));
}

// **SAVE MARKS FUNCTION TO STORE MARKS IN BACKEND**
function saveMarks(slideId, correctMark, incorrectMark) {
    fetch('/save_marks', {  // Updated to match backend route
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            slideId: slideId,           // Matches 'slide_id' in Python
            correctMark: correctMark,   // Matches 'correct_mark' in Python
            incorrectMark: incorrectMark // Matches 'incorrect_mark' in Python
        }),
    })
    .then(response => {
        if (!response.ok) {  // Check for HTTP errors
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Marks saved successfully:", data);
    })
    .catch(error => console.error('Error saving marks:', error));
}


// **ATTACH CONFIRM BUTTON EVENT FOR GAME2**
const confirmBtnGame2 = document.getElementById('confirm2');
if (confirmBtnGame2) { 
    confirmBtnGame2.addEventListener('click', function(event) {
        event.preventDefault();  // Prevent form submission
        const slideId = `slide${currentSlide}`;
        checkAnswerGame2(slideId); // Send answers to server for validation
    });
} else {
    console.log("confirmBtnGame2 not found. Skipped it");
}
// ** Here I will build a route to handle the latest played record,saved it to the most imporatant database and delete from the temporary database
    // Score Return function 
    const returnBtn = document.getElementById("return");
    if (returnBtn) {
        returnBtn.addEventListener('click', function(event) {
            event.preventDefault(); 
            const currentGameToR = window.location.pathname.includes("scores1") ? "scores1" : "scores2";
            if (currentGameToR === "scores1") {
                console.log("scores from Assets are returning");
                window.location.href = '/return_scores1';
            } else if (currentGameToR === 'scores2') {
                console.log("scores from SlideScores are returning");
                window.location.href = '/return_scores2';
            }
        });
    } else {
        console.log("ReturnScore is skipped");
    }

    // **PASSWORD TOGGLE FUNCTION**
    const viewFunction = function() {
        const password = document.getElementById("password");
        const confirmation = document.getElementById("confirmation");

        // Check if both password fields exist
        if (password && confirmation) {
            if (password.type === "password" && confirmation.type === "password") {
                password.type = "text";
                confirmation.type = "text";
            } else {
                password.type = "password";
                confirmation.type = "password";
            }
        }
    };
    
    // **PASSWORD VALIDATION**
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('submitButton');
    const messageElement = document.getElementById('message');

    if (passwordInput && submitButton && messageElement) {  // Check if the elements exist
        function validatePassword() {
            const password = passwordInput.value;
            let message = "";
            let isValid = true;

            if (password.length < 6) {
                message = "Length should be at least 6";
                isValid = false;
            } else if (password.length > 20) {
                message = "Length should not be greater than 20";
                isValid = false;
            } else if (!/\d/.test(password)) {
                message = "Password should have at least one numeral";
                isValid = false;
            } else if (!/[A-Z]/.test(password)) {
                message = "Password should have at least one uppercase letter";
                isValid = false;
            } else if (!/[a-z]/.test(password)) {
                message = "Password should have at least one lowercase letter";
                isValid = false;
            } else if (!/[$@#%]/.test(password)) {
                message = "Password should have at least one of the symbols $@#%";
                isValid = false;
            } else {
                message = "Password is Valid";
            }

            messageElement.textContent = message;
            messageElement.style.color = isValid ? 'green' : 'red';
            submitButton.disabled = !isValid;  // Disable submit button if password is invalid
        }

        passwordInput.addEventListener('input', validatePassword);
        validatePassword();  // Initial validation
    }

// **SLIDESHOW NAVIGATION**
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const nextButton = document.getElementById("next");
console.log("Slides Found:", slides.length); // Debugging
console.log("Next Button Found:", nextButton); // Debugging

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.display = i === index ? "block" : "none"; // Show or hide based on index
    });
}

// Show the first slide initially
showSlide(currentSlide);

// Here I will check that game1 is running or game2 in this process
const currentGame = window.location.pathname.includes("game1") ? ("game1"):("game2");
// Event listener for the "Next" button
nextButton.addEventListener("click", function() {
    console.log("Current Slide before increment:", currentSlide);

    // Increment the current slide index, reset if at the end
    currentSlide++;

    // I need to add the implementation about the next button performance on the latest slide of my html
    // In this condition, it would be a condition about the currentslide = slide.length
    // if these are equal, we can say that it is the last slide and we can put an implementaion here.
    if (currentSlide >= slides.length) {
        console.log("Current Slide Number is:", currentSlide);
        console.log("The slides existed on this html page:", slides.length);
        console.log("We are on the last slide");
        // redirecting to the correct page depending on the type of game
        if (currentGame == "game1") {
            console.log("The current game is game1 so it will be redirected to scores1 path");
            // it is for the rendering game1 to score1
            window.location.href = '/scores1';
        } else if (currentGame == "game2") {
            console.log("The current game is game2 so it will be redirected to scores2 path");
            // it is for the rendering game1 to score1
            window.location.href = '/scores2';
        }
        // even though silde switching will perform the same on both slides, for game2,I wanna redirect to score2 path
        // let's think and approach this case right here
    } else {
        console.log("Current Slide after increment:", currentSlide);
        // show the current slide
        showSlide(currentSlide);
    }
    // Re-enable the confirm button on the next slide
    if (typeof confirmBtn !== "undefined") {
        confirmBtn.disabled = false;
    }
});
});
 // } 


// Function to retrieve the value of a specific cookie by name
function getCookie(name) {
    // const value = `; ${document.cookie}`;
    // const parts = value.split(`; ${name}=`);
    // if (parts.length === 2) return parts.pop().split(';').shift();

    return "this is the session cookie"
}

// run this function when you want to check the answer.
function checkAnswer(slide, answer) {
    console.log("check answer is called.")
    try {
        const sessionCookie = getCookie("session");
        console.log(sessionCookie);
        const response = fetch('/check_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session': sessionCookie
            },
            body: JSON.stringify({ "slideName": slide, "answer": answer }),
        });

        //TODO: somewhere around here the response is not ok even if the server responded with 200.
        if (response.status !== 200) {
            if (response.status == 400) {
                console.log(response.message);
                alert("You've done something wrong in frontend.");
            } else if (response.status == 401) {
                console.log(response.message);
                alert("You don't have session cookie, please login again and try this function later.");
            }
        } else {

            // remove after testing.
            // implement the given answer to your front end.
            // backend will respond with { "correct": boolean value }

            const data = response.json();
            // why is data being red-lined?
            console.log("data: ", data)
            if (data.correct === true) {
                alert("Your answer is correct.")
                console.log("Your answer is correct.")
            } else {
                alert("Your answer is not correct")
                console.log("Your answer is not correct")
            }
        }
    } catch (error) {
        console.log(error)
        alert('An error occurred. Please try again.');
    }
}
