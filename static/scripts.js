// Wrap everything inside a single DOMContentLoaded listener
console.log("Javascript is loaded");

document.addEventListener('DOMContentLoaded', function() {
  // ** FORM SUBMISSION HANDLER **
  const registerForm = document.getElementById('registerForm');

  if (registerForm) { // Check if the form exists on this page
    registerForm.onsubmit = async function(event) {
      event.preventDefault(); // Prevent the default form submission behavior

      const formData = new FormData(this); // Collect form data
      // This was the data fetchin process.
      // Source: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
      try {
        const response = await fetch('/register', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json(); // Parse JSON from response
        const notification = document.getElementById('notification');

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

  // ** Checkbox and Submit Button Interaction for Answer Selection **
  const confirmBtn = document.getElementById('confirm1');
  const answerInput = document.querySelector('input[name="answer"]');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent the form submission
      let flipTimeout = 0;
      let slideNum = currentSlide + 1;
      let userAnswer = "incorrect";

      // Check if the checkbox is selected and flip the card accordingly
      // I implemented a default function to accept different slideNumbers and handles flipping
      // .checks deals with toggling the check-box.
      if (document.getElementById(`checkbox1_slide${slideNum}`).checked) {
        document.querySelector(`.card-variant-1_slide${slideNum}`).classList
.toggle('flipped');
        // setting the flipping time as my preference
        flipTimeout = 1500;
        answerInput.value = "correct";
        userAnswer = answerInput.value;
      } else if (document.getElementById(`checkbox2_slide${slideNum}`)
.checked) {
        document.querySelector(`.card-variant-2_slide${slideNum}`).classList
.toggle('flipped');
        flipTimeout = 1500;
        answerInput.value = "incorrect";
        userAnswer = answerInput.value;
      }
      // setting the button disable to avoid unneccessay submissions
      // references - https://www.w3schools.com/jsref/prop_pushbutton_disabled.asp
      confirmBtn.disabled = true;
      // fetch api process
      // references - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
      setTimeout(() => {
        fetch('/game1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answer: userAnswer }),
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

  // ** GAME2 CHECK ANSWERS FUNCTION WITH MARK TRACKING AND BACKEND LINK **
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
        // a default program to search the blank and slide ids for several slide and blanks
        // source- https://www.w3schools.com/jsref/jsref_regexp_digit.asp
        blanks.forEach(blank => {
          const blankId = blank.id.match(/blank(\d+)_slide\d+/)[1];
        // setting the color of the border depending on the answer
        // source - https://www.w3schools.com/jsref/prop_style_bordercolor.asp
          if (correctAnswers[blankId]) {
            correctMark++;
            blank.style.borderColor = "green"; // Indicate correct
          } else {
            incorrectMark++;
            blank.style.borderColor = "red"; // Indicate incorrect
          }
        });

        // Optionally, send the marks to the backend for tracking
        saveMarks(slideId, correctMark, incorrectMark);
      })
      .catch(error => console.error('Error:', error));
  }

  // ** SAVE MARKS FUNCTION TO STORE MARKS IN BACKEND **
  function saveMarks(slideId, correctMark, incorrectMark) {
    fetch('/save_marks', { // Updated to match backend route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slideId: slideId, // Matches 'slide_id' in Python
        correctMark: correctMark, // Matches 'correct_mark' in Python
        incorrectMark: incorrectMark // Matches 'incorrect_mark' in Python
      }),
    })
      .then(response => {
        if (!response.ok) { // Check for HTTP errors
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Marks saved successfully:", data);
      })
      .catch(error => console.error('Error saving marks:', error));
  }

  // ** ATTACH CONFIRM BUTTON EVENT FOR GAME2 **
  const confirmBtnGame2 = document.getElementById('confirm2');
  if (confirmBtnGame2) {
    confirmBtnGame2.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent form submission
      const slideId = `slide${currentSlide}`;
      checkAnswerGame2(slideId); // Send answers to server for validation
    });
  } else {
    console.log("confirmBtnGame2 not found. Skipped it");
  }

  // ** Score Return Function **
  const returnBtn = document.getElementById("return");
  if (returnBtn) {
    returnBtn.addEventListener('click', function(event) {
      event.preventDefault();
      const currentGameToR = window.location.pathname.includes("scores1") ?
"scores1" : "scores2";
      if (currentGameToR === "scores1") {
        console.log("scores from Assets are returning");
        // redirecting the browser to a new page.
        // source - https://www.w3schools.com/js/js_window_location.asp
        window.location.href = '/return_scores1';
      } else if (currentGameToR === 'scores2') {
        console.log("scores from SlideScores are returning");
        window.location.href = '/return_scores2';
      }
    });
  } else {
    console.log("ReturnScore is skipped");
  }

  // ** Exit Button Function **
  const exitBtn = document.getElementById("exit");
  if (exitBtn) {
    exitBtn.addEventListener('click', function(event) {
      console.log('Exit button is working');
      window.location.href = '/exit';
    });
  } else {
    console.log("Exit button is skipped");
  }
// **SLIDESHOW NAVIGATION**
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const nextButton = document.getElementById("next");
// a function about switching from one slide to another slide
// source - https://www.w3schools.com/howto/howto_js_slideshow.asp
function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.display = i === index ? "block" : "none"; // Show or hide based on index
  });
}

// Show the first slide initially
showSlide(currentSlide);

// Here I will check that game1 is running or game2 in this process
// redirecting to certain page depending on the pathname
// source - https://www.w3schools.com/js/js_window_location.asp
const currentGame = window.location.pathname.includes("game1") ? ("game1") : ("game2");
// Event listener for the "Next" button
nextButton.addEventListener("click", function() {
  console.log("Current Slide before increment:", currentSlide);

  // Increment the current slide index, reset if at the end
  currentSlide++;

  // I need to add the implementation about the next button performance on the latest slide of my html
  // In this condition, it would be a condition about the currentslide = slide.length
  // if these are equal, we can say that it is the last slide and we can put an implementaion here.
  if (currentSlide >= slides.length) {
    // redirecting to the correct page depending on the type of game
    if (currentGame == "game1") {
      // console.log("The current game is game1 so it will be redirected to scores1 path");
      // it is for the rendering game1 to score1
      window.location.href = '/scores1';
    } else if (currentGame == "game2") {
      // console.log("The current game is game2 so it will be redirected to scores2 path");
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

