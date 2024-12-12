CREATE TABLE promos (
    promo_id INT PRIMARY KEY,
    discount_amount FLOAT,
    discounted_item INT,
    FOREIGN KEY (discounted_item) REFERENCES menu_items(menu_item_id)
);

INSERT INTO promos (promo_id, discount_amount, discounted_item) VALUES 
    (1, 4.56, 1),
    (2, 3.41, 2),
    (3, 3.68, 3),
    (4, 2.19, 4),
    (5, 3.39, 5),
    (6, 1.18, 6),
    (7, 2.57, 7),
    (8, 3.12, 8),
    (9, 1.94, 9),
    (10, 1.94, 10),
    (11, 4.16, 11),
    (12, 4.6, 12),
    (13, 2.66, 13),
    (14, 2.28, 22),
    (15, 2.37, 23),
    (16, 3.68, 24),
    (17, 4.27, 25)
