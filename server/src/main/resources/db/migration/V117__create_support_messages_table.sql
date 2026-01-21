CREATE TABLE support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE support_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    sent_at DATETIME,
    CONSTRAINT fk_support_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id),
    CONSTRAINT fk_support_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id)
);
