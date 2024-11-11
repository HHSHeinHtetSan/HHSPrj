## My ProjectName - Qz50 Quiz Games
My project is a flask application based mostly on python.It is created for educational purposes like small tests and quiz games.I got an inspiration about this project from Duolingo English Test.

## Video Demo: https://youtu.be/qVeSaZtC92A
## Description
This project is a web application created by Flask.It can handles different users, stronger security and better user management.Further more,it is designed to put more questions as the user's preferences.

Even though three slides of game1 and two slides of game2 were put,if a user wants to add more,it can handles well.

Game1 is about the choosing the multiple choice from the provided two flash cards.If a certain card is chosen,the card wil be flipped and a mark about being correct or incorrect will be added to the respective database.After finishing the game,the total correct,incorrect answers will be displayed via the pie chart.

And for game2, it is about a quiz game.We need to fill in the blanks and the correct answers are stored in the database respectively to the slide_id and blank_id.Every answer submitted via the blank would be compared with the correct answer stored in the database.After that the scores obtained will be shown in bar charts.

After game1 and game2 were played,the scores obtained by the user will be displayed at the portfolio page.

## Implementation about password on register and password changing
To avoid the weak password being used,I implemented a certain function to check the password length and components.

Furthermore, a python function Levenshtein distance is used in password changing function.When a user did a small change in the new password and set it,it won't be accepted.

## File and Structure

### app.py
Handles most of the backend process, especially database process linked with the frontend and rendering html pages.

### styles.css
It is used to design and format every single html pages in my project.

### scripts.js
This file mostly deals with the frontend process. Mostly submitting the answer, switching slide and performing random animatons on my webpage.

### index.html
Describes the portfolio of the currently logged-in user.

### game1.html, game2.html
These files perform the respective process linked the path on backend.

### scores1.html, scores2.html
scores1 page describes the data obtained from the game1 via pie-chart.
scores2 page describes the data obtained from the game2 via bar-chart.

### register.html
This file takes inputs from the user and register the new user.
I put a certain javascript code on this file about handling the weak password problem.

### pass_change.html
Deals with the password changing process.
Contains a certain javascript function to control reusing the old passwords and similar ones compared to those.

### layout.html
Main frame page for most of my html page as I used a jinja template and implemented different aspects on this.
I references this page from Week9 ProblemSet 9,finance.

### login.html
Handles with logging in function and takes input from the person to log in.

### schema.sql
Contains six tables to handle various data obtained from this program.

## References
#### For flash cards and flipping cards on game1 -
https://www.w3schools.com/howto/howto_css_flip_card.asp

#### For slide switching process
https://www.w3schools.com/howto/howto_js_slideshow.asp

#### Frontend handling and database process
cs50x-week6-Python,week7-SQL

#### User registering, passwordchanging
cs50x-week9-Flask-Problemset9-Finance

#### Control reusing the old_passwords
##### Levenshtein Distance  

https://www.geeksforgeeks.org/introduction-to-levenshtein-distance/
https://pypi.org/project/python-Levenshtein/
https://en.wikipedia.org/wiki/Levenshtein_distance

#### json data fetching process

https://developer.mozilla.org/en-US/docs/Web/API/Request/json
https://www.freecodecamp.org/news/how-to-read-json-file-in-javascript/
https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

#### For pie chart and bar charts

https://www.w3schools.com/js/js_graphics_chartjs.asp

### Ending

CS50 was an amazing course for me.It was really invaluable milestone of my coding journey.At the very first, I was lack in knowledge about computer science.But CS50 give me a new spark to continue this long journey.
I am wiling to take more of CS50 new courses with pleasure.
Thanks you very much to Professor David J.Malan and CS50 team.
I would like to mention about my classmates from CS50 facebook group.Thank you guys for interesting discussions on several pset.
And for the last "This was CS50".

