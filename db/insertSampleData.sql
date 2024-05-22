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

INSERT INTO category (name, is_primary)
VALUES
    ('Cat A', true),
    ('Cat B', true),
    ('Cat C', false),
    ('Cat D', true)
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

INSERT INTO attachment (factoid_id, link, type)
VALUES
    (1, 'https://www.youtube.com/watch?v=VAH-ixdFWFs', 'youtube'),
    (1, 'puppy.jpg', 'image'),
    (1, 'http://thirty-seven.org/index.html', 'website'),
    (1, 'gif.gif', 'image'),
    (1, 'sound.mp3', 'audio'),
    (2, 'https://example.com/image.jpg', 'image'),
    (3, 'https://example.com/audio.mp3', 'audio')
;
