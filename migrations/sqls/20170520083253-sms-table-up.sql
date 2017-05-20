CREATE TABLE sms (
    id serial primary key,
    content text,
    sender text,
    createdat TIMESTAMP WITH TIME ZONE,
    updatedat TIMESTAMP WITH TIME ZONE
);
