-- Tables are created below. Drop statements removed to prevent 'Unknown table' warnings on fresh install.

CREATE TABLE saved_properties (
    id BIGINT AUTO_INCREMENT NOT NULL,
    user_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    saved_at TIMESTAMP,
    CONSTRAINT pk_saved_properties PRIMARY KEY (id),
    CONSTRAINT uk_saved_properties_user_property UNIQUE (user_id, property_id),
    CONSTRAINT fk_saved_properties_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_saved_properties_property FOREIGN KEY (property_id) REFERENCES properties (id)
);

CREATE TABLE saved_roommates (
    id BIGINT AUTO_INCREMENT NOT NULL,
    user_id BIGINT NOT NULL,
    roommate_post_id BIGINT NOT NULL,
    saved_at TIMESTAMP,
    CONSTRAINT pk_saved_roommates PRIMARY KEY (id),
    CONSTRAINT uk_saved_roommates_user_post UNIQUE (user_id, roommate_post_id),
    CONSTRAINT fk_saved_roommates_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_saved_roommates_post FOREIGN KEY (roommate_post_id) REFERENCES roommate_posts (id)
);
