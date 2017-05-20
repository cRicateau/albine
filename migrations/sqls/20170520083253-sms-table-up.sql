CREATE TABLE sms (
    id UUID PRIMARY KEY,
    content text,
    sender text,
    createdat TIMESTAMP WITH TIME ZONE,
    updatedat TIMESTAMP WITH TIME ZONE
);
