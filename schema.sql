CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    username    TEXT NOT NULL,
    hash        TEXT NOT NULL
);
CREATE UNIQUE INDEX username_idx ON users(username);

CREATE TABLE Answers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slide_id    INTEGER,
    blank_id    INTEGER,
    answer      TEXT
);

CREATE TABLE SlideScores (
    user_id         INTEGER,
    slide_id        INTEGER,
    correct_mark    INTEGER,
    incorrect_mark  INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE old_passwords (
    user_id     INTEGER,
    password       TEXT, -- fix this to store hash.
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE Assets (
    user_id     INTEGER,
    correct_score    INTEGER,
    incorrect_score  INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE scores (
    user_id         INTEGER,
    game1_score     INTEGER,
    game2_score     INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);