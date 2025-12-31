CREATE TABLE roommate_posts
(
    id                BIGINT AUTO_INCREMENT NOT NULL,
    user_id           BIGINT                NOT NULL,
    location          VARCHAR(255)          NOT NULL,
    budget            DOUBLE                NOT NULL,
    move_in_date      date                  NULL,
    bio               TEXT                  NULL,
    gender_preference VARCHAR(255)          NULL,
    smoking           BIT(1)                NULL,
    pets              BIT(1)                NULL,
    occupation        VARCHAR(255)          NULL,
    created_at        datetime              NULL,
    updated_at        datetime              NULL,
    CONSTRAINT pk_roommate_posts PRIMARY KEY (id)
);

ALTER TABLE roommate_posts
    ADD CONSTRAINT FK_ROOMMATE_POSTS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE users
    DROP COLUMN account_status;

ALTER TABLE users
    DROP COLUMN auth_provider;

ALTER TABLE users
    ADD account_status VARCHAR(255) NOT NULL;

ALTER TABLE users
    ADD auth_provider VARCHAR(255) NOT NULL;

ALTER TABLE properties
    MODIFY created_at datetime NULL;

ALTER TABLE properties
    MODIFY inquiries INT NOT NULL;

ALTER TABLE messages
    DROP COLUMN message_type;

ALTER TABLE messages
    ADD message_type VARCHAR(255) NOT NULL;

ALTER TABLE properties
    MODIFY price_amount DECIMAL;

ALTER TABLE reports
    DROP COLUMN reason;

ALTER TABLE reports
    DROP COLUMN severity;

ALTER TABLE reports
    DROP COLUMN status;

ALTER TABLE reports
    ADD reason VARCHAR(255) NOT NULL;

ALTER TABLE user_roles
    DROP COLUMN `role`;

ALTER TABLE user_roles
    ADD `role` VARCHAR(50) NULL;

ALTER TABLE user_roles
    MODIFY `role` VARCHAR(50) NULL;

ALTER TABLE reports
    ADD severity VARCHAR(255) NOT NULL;

ALTER TABLE applications
    DROP COLUMN status;

ALTER TABLE applications
    ADD status VARCHAR(255) NOT NULL;

ALTER TABLE bookings
    DROP COLUMN status;

ALTER TABLE bookings
    ADD status VARCHAR(255) NOT NULL;

ALTER TABLE properties
    MODIFY status VARCHAR(255);

ALTER TABLE properties
    MODIFY status VARCHAR(255) NOT NULL;

ALTER TABLE reports
    ADD status VARCHAR(255) NOT NULL;

ALTER TABLE notifications
    DROP COLUMN type;

ALTER TABLE notifications
    ADD type VARCHAR(255) NOT NULL;

ALTER TABLE properties
    MODIFY verified BIT(1) NOT NULL;

ALTER TABLE properties
    MODIFY views INT NOT NULL;