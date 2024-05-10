INSERT INTO factoid (content, note, is_approved, approval_date)
VALUES
    ('There are 37 holes in the mouthpiece of a telephone',
    'I''m talking about "old" style phones with the "Mickey Mouse" handsets that have the round mouthpieces with roughly the following pattern of holes:

                o o o o
               o o o o o
              o o o o o o
             o o o o o o o
              o o o o o o
               o o o o o
                o o o o',
    true, 
    '2024-05-09T22:19:56+0000'),
    ('There are 37 bars in the digits of a digital watch.',
    'It has to be a 12-hour-mode display, and you have to count the seconds:

                _     _   _     _   _
             | |_| * |_| |_| * |_| |_|
             | |_| * |_| |_| * |_| |_|',
    true, 
    '2024-05-09T22:19:56+0000'),
    ('All American Express card numbers begin with 37.', null, true, '2024-05-09T22:19:56+0000'),
    ('fact a', null, true, null),
    ('fact b', null, true, null),
    ('fact c', null, true, null),
    ('fact d', null, true, null),
    ('fact e', null, true, null),
    ('unapproved fact', null, false, null)
;

INSERT INTO category (name)
VALUES
    ('Cat A'),
    ('Cat B'),
    ('Cat C'),
    ('Cat D')
;

INSERT INTO tag
VALUES
    (1, 1),
    (2, 2),
    (2, 3),
    (3, 1),
    (4, 2),
    (6, 4),
    (2, 4),
    (7, 3),
    (7, 4)
;