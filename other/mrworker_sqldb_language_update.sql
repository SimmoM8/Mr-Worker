
    ALTER TABLE courses 
    CHANGE COLUMN course course_lang_1 VARCHAR(50) NOT NULL,  -- Renaming existing column
    CHANGE COLUMN country country_lang_1 VARCHAR(25) NOT NULL,  -- Renaming existing column
    ADD COLUMN country_lang_2 VARCHAR(25) DEFAULT NULL,  -- Renaming existing column
    ADD COLUMN course_lang_2 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN course_lang_3 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN course_lang_4 VARCHAR(50) DEFAULT NULL;
    

    ALTER TABLE education 
    CHANGE COLUMN skill skill_lang_1 VARCHAR(255) NOT NULL,  -- Renaming existing column
    ADD COLUMN skill_lang_2 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN skill_lang_3 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN skill_lang_4 VARCHAR(255) DEFAULT NULL;
    

    ALTER TABLE employers 
    CHANGE COLUMN job_position job_position_lang_1 VARCHAR(50) NOT NULL,  -- Renaming existing column
    CHANGE COLUMN country country_lang_1 VARCHAR(25) NOT NULL,  -- Renaming existing column
    ADD COLUMN country_lang_2 VARCHAR(25) DEFAULT NULL,  -- Renaming existing column
    ADD COLUMN job_position_lang_2 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN job_position_lang_3 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN job_position_lang_4 VARCHAR(50) DEFAULT NULL;
    

    ALTER TABLE hard_skills 
    CHANGE COLUMN skill skill_lang_1 VARCHAR(255) NOT NULL,  -- Renaming existing column
    ADD COLUMN skill_lang_2 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN skill_lang_3 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN skilll_lang_4 VARCHAR(255) DEFAULT NULL;
    

    ALTER TABLE languages 
    CHANGE COLUMN language language_lang_1 VARCHAR(50) NOT NULL,  -- Renaming existing column
    ADD COLUMN language_lang_2 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN language_lang_3 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN language_lang_4 VARCHAR(50) DEFAULT NULL;
    

    ALTER TABLE licenses 
    CHANGE COLUMN license license_lang_1 VARCHAR(50) NOT NULL,  -- Renaming existing column
    CHANGE COLUMN `description` description_lang_1 VARCHAR(255) NOT NULL,  -- Renaming existing column
    ADD COLUMN license_lang_2 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN license_lang_3 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN license_lang_4 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN description_lang_2 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN description_lang_3 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN description_lang_4 VARCHAR(255) DEFAULT NULL;
    

    ALTER TABLE resumes 
    CHANGE COLUMN job_position job_position_lang_1 VARCHAR(50) NOT NULL,  -- Renaming existing column
    ADD COLUMN job_position_lang_2 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN job_position_lang_3 VARCHAR(50) DEFAULT NULL,
    ADD COLUMN job_position_lang_4 VARCHAR(50) DEFAULT NULL;
    

    ALTER TABLE soft_skills 
    CHANGE COLUMN skill skill_lang_1 VARCHAR(255) NOT NULL,  -- Renaming existing column
    ADD COLUMN skill_lang_2 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN skill_lang_3 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN skill_lang_4 VARCHAR(255) DEFAULT NULL;


    ALTER TABLE users 
    CHANGE COLUMN country country_lang_1 VARCHAR(25) NOT NULL,  -- Renaming existing column
    ADD COLUMN country_lang_2 VARCHAR(25) DEFAULT NULL,
    CHANGE COLUMN about_me about_me_lang_1 TEXT,  -- Renaming existing column
    ADD COLUMN about_me_lang_2 TEXT,
    ADD COLUMN about_me_lang_3 TEXT,
    ADD COLUMN about_me_lang_4 TEXT;
    

    ALTER TABLE work_experience 
    CHANGE COLUMN skill skill_lang_1 VARCHAR(255) NOT NULL,  -- Renaming existing column
    ADD COLUMN skill_lang_2 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN skill_lang_3 VARCHAR(255) DEFAULT NULL,
    ADD COLUMN skill_lang_4 VARCHAR(255) DEFAULT NULL;
    

CREATE TABLE user_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lang_1 VARCHAR(10) NOT NULL DEFAULT 'en',  -- Default language is English
    lang_2 VARCHAR(10) DEFAULT NULL,
    lang_3 VARCHAR(10) DEFAULT NULL,
    lang_4 VARCHAR(10) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE further_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entry_id INT NOT NULL,  -- ID of the row in its respective table
    entry_type ENUM('employer', 'course', 'hard_skill', 'soft_skill', 'language', 'licence', 'country', 'about_me', 'education', 'work_experience') NOT NULL,
    field_name VARCHAR(50) NOT NULL,  -- e.g., 'employer', 'course', etc.
    language_code VARCHAR(10) NOT NULL,  -- e.g., 'es' for Spanish
    translated_text TEXT NOT NULL,
    UNIQUE KEY (entry_id, entry_type, field_name, language_code),
    FOREIGN KEY (user_id) REFERENCES users(id)
);