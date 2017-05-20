CREATE TABLE tweet (
    id serial primary key,
    content text,
    sender text,
    createdat TIMESTAMP WITH TIME ZONE,
    updatedat TIMESTAMP WITH TIME ZONE
);

CREATE TABLE vote (
    id serial primary key,
    sender text,
    albert integer,
    pauline integer
);

CREATE TABLE question (
    id serial primary key,
    question text,
    right_answer text
);

CREATE TABLE answer (
    id serial primary key,
    sender text,
    question_id integer references question(id),
    answer text,
    createdat TIMESTAMP WITH TIME ZONE,
    updatedat TIMESTAMP WITH TIME ZONE
);

CREATE TABLE mode (
    id serial primary key,
    mode text,
    question_id integer references question(id)
);
