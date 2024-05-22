INSERT INTO factoid (content, note, is_approved, approval_date)
VALUES
    -- amazing(5) 1-5
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
    ('There are 37 miracles in the Bible.', 
    '
    I don''t know what is going on here. Many people have told me this is impossible. 
    They always say things like "there have to be a lot more than that", or start musing on what sorts of contrivances might have been applied to the set of miracles that "count" to arrive at 37.

    All I know is I have a little scrap of paper, about 15 years old, which says in my handwriting "37 miracles in the Bible". 
    My assumption (though I don''t remember) is that someone told me the factoid, and I scribbled it down so I wouldn''t forget.

    Any light that an alert reader could shed on this stressful situation would be appreciated.
    ', true, null),
    ('In the Bible, Psalm 37 is one of the few that are acrostic.', 'The first letter of every other verse is a consecutive letter of the Hebrew alphabet.', true, null),
    -- historical(6) 6-10
    ('William Shakespeare wrote 37 plays.', 
    '10 histories, 10 tragedies, 17 comedies.

    Some Shakespeare links:

    The Complete Works of William Shakespeare (at MIT)
    The Collected Works of Shakespeare (in Australia)
    Yahoo''s Shakespeare page', true, null),
    ('There were 37 concerts in Michael Jackson''s "Victory Tour" in summer 1984.', null, true, null),
    ('Michael Jackson''s album "Thriller" was #1 for 37 weeks on the Billboard album chart.', 
    'Thanks to alert contributor John Thorpe.', true, null),
    ('The Hindenburg took 37 seconds to burn (in 1937).', null, true, null),
    ('1937 was the most horrid year in terms of Stalinistic Repressions.', 
    'Contributed by The 37 Group of Boston.', true, null),
    
    ('unapproved fact', null, false, null),
    -- ephemeral(7) 12-16
    ('There are 37 million Americans without health insurance.', 
    'Chicago Tribune front page story, sometime in the spring of 1993.', true, null),
    ('Levi Strauss Corp. has 37 manufacturing plants in North America.', 
    'Newspaper article, sometime in August 1993.', true, null),
    ('About 1 in 37 major league baseball pitchers wears number 37.', 
    'I''ve always thought 37 was a popular number for major league baseball pitchers, but finally, thanks to Milt Epstein, I have some evidence. He collected data from Usenet on the jersey numbers of MLBers, and wrote a script to do some stats on the pitchers'' numbers. Here is the top portion of the list:

    Of 366 pitchers on 28 teams:
        Number  Count   Percent [sic]
        41      16      0.0437158469945355
        40      14      0.0382513661202186
        49      13      0.0355191256830601
        43      13      0.0355191256830601
        33      12      0.0327868852459016
        31      12      0.0327868852459016
        32      12      0.0327868852459016
        50      12      0.0327868852459016
        52      12      0.0327868852459016
        51      11      0.0300546448087432
        46      11      0.0300546448087432
        36      11      0.0300546448087432
        35      11      0.0300546448087432
        47      10      0.0273224043715847
        38      10      0.0273224043715847
        27      10      0.0273224043715847
        45      10      0.0273224043715847
        42      9       0.0245901639344262
        37      9       0.0245901639344262      <--------
        39      8       0.0218579234972678
        48      8       0.0218579234972678
    ...
    So 37 did not fare quite as well as I had hoped it would, but we are still able to make a couple of broad statements: 37 is more popular than average. And (interestingly) about 1 of every 37 pitchers wear the number 37.', true, null),
    ('More than 37,000 things reside on the Xerox Web Site.', 
    'Or so says the introductory paragraph on their search page, as of May 1997. In particular, it says:

    We''ve attempted to provide the best search engines for you to access the more than thirty-seven thousand products, services, case studies, application notes and other items residing on the Xerox Web Site.', true, null),
    ('An Open Text Index search for 37s returned 37 hits.', 
    'In particular, I did a "power search", and asked for "thirty-seven" in "summary" OR "thirty-seven" in "title". Cool, man.', true, null),
    -- random(8) 17-21
    ('The Maelstrom space ship has ACME XQJ-37 retro-thrusters.', 
    'Maelstrom is an Asteroids-like computer game for the Mac. Here''s a quote from the "About Maelstrom" information window, which reads as if narrated by the pilot of the little ship that you''re flying around in the game:

    "I slammed the ACME XQJ-37 retro-thrusters on full barrel and managed to duck back behind Jupiter before they took notice of me, but I darn near soiled my space suit."', true, null),
    ('Chuck Carroll randomly produced a 37.', 
    'There was a thread on rec.puzzles to make up "nugry" versions of popular puzzles. Several posters randomly numbered the puzzles they posted, so it would appear to the casual reader that the puzzles had been taken from some treasury of puzzles.

    >Date: 6 Nov 1996 14:44:20 -0700
    >From: ccarroll@nyx.cs.du.edu (Charles Carroll)
    >Subject: Re: Nugry''s Treasury of Puzzles
    >Newsgroups: rec.puzzles
    >
    >37. There are two players in a single-elimination singles tennis
    >tournament.  How many matches must be played to determine the
    >tournament winner?
    >
    >--
    >Chuck Carroll                                     http://www.dfw.net/~ccarroll/
    >', true, null),
    ('37 meals a day are optimal.', 
    'This tidbit appeared in a letter to the editor of the Annals of Improbable Research, and should be treated with all due respect. The full letter:

    Difficult to Swallow

    Distinguished editors:

    I have been testing the long-believed, little-examined theory that 
    three meals a day are optimal for health and longevity.

    My data, derived from longitudinal studies during the years 1964-
    1990 of more than 20,000 health professionals throughout Italy, 
    appear to indicate that there are several optimal numbers. Three 
    meals a day indeed are indeed best, but seven meals a day also 
    provide very good results, as do nine meals a day.

    The data also appear to indicate that 37 meals a day are optimal. 
    This strikes me on the face of it as being flat-out wrong, but the 
    data are there, and I am at a loss as to how to explain them. 
    Perhaps one of your readers can offer an explanation.

    Patrice M. Arruda, Ph.D.
    Foggia, Italy', true, null),
    ('Michiel Boland reports that 37 gets used a lot by mathematicians at the University of Nijmegen, The Netherlands.', null, true, null),
    ('Gary Greenberg once rolled 37 on a d100 three times in a row.', null, true, null),
    -- sports(9) 22-26
    ('Bo Jackson gained 37 yards (on 12 carries) in his first NFL appearance.', null, true, null),
    ('Magic Johnson and Larry Bird competed against each other in 37 NBA games.', null, true, null),
    ('Mark McGwire''s 37 home runs in 1987 broke Al Rosen''s 37-year-old American League rookie record.', null, true, null),
    ('The Illini basketball team was ranked #1 in the AP poll in 1989 for the first time in 37 years.', null, true, null),
    ('Kansas won the NCAA basketball championship in 1988 for the first time in 37 years.', null, true, null),
    -- scientific(10) 27-31
    ('"Normal" human body temperature is 37 degrees Celsius.', 
    'This is based on the old idea that "normal" body temperature is 98.6 degrees Fahrenheit. This is exactly 37 degrees Celsius:

    C = (5/9) * (F - 32)
      = (5/9) * (98.6 - 32)
      = (5/9) * (66.6)
      = (5/9) * (66 + 3/5)
      = (5/9) * (333/5)
      = 333/9
      = 37
    I''d heard before that it''s actually questionable whether 37 is really the average. Alert reader Russell Schulz points out that a 1992 article in the Journal of the American Medical Association found the actual average to be about 98.2. But I won''t tell if you won''t. :-)

    By the way, the 1992 JAMA article was based on a study of 148 people -- a multiple of you-know-what.

    Here''s a related article from 1996, which discusses using the dataset from the 1992 JAMA article to teach some statistical concepts.', true, null),
    ('Radio signals from the Galileo spacecraft confirming the launch of a Jupiter atmospheric probe took 37 minutes to reach Earth.', 
    'From a NASA news release (July 1995): "GALILEO TO RELEASE JUPITER ATMOSPHERIC PROBE ... The probe and its payload of scientific instruments will be deployed from the main Galileo spacecraft at 1:30 a.m. EDT July 13 and fly solo the remaining 51 million miles to Jupiter over the next five months. Confirmation of the release will be received 37 minutes later, the time necessary for the radio signal to travel back to Earth at the speed of light."

    Contributed by alert reader Jerry McCollom.', true, null),
    ('The correct amount of Tasmanian Muttonbirds to harvest is 37% of the chicks present when the season opens in March.', 
    '"Based on population research, I calculate that a safe harvest level [for sustained, healthy populations] is 37 percent of the [Tasmanian Muttonbird] chicks present when the season opens in March." from Irynej, Skira, "A Muttonbird in the Hand", Natural History, August 1995.

    Contributed by alert reader Dennis Linse.', true, null),
    ('There are 37 genes in the mitochondrial genome.', 
    'This is a circular piece of DNA that is located in each of the mitochondria in animal cells.

    Contributed by alert reader Adam Gower.', true, null),
    ('Blue light spans 37 nm of the visible wavelength spectrum.', null, true, null),
    -- personal(11) 32-36
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    -- numerical(12) 37-41
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    -- movies(13) 42-46
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    -- comics(14) 47-51
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    -- media(15) 52-56
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    -- 37th things(16) 57-61
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    -- pictures(17) 62-66
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    -- sounds(18) 67-71
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    -- links(19) 72-76
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    -- multiples(20) 77-81
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
    ('fact e', null, true, null),
;

-- 10:21
INSERT INTO category (name, is_primary)
VALUES
    ('Cat A', false),
    ('Cat B', false),
    ('Cat C', false),
    ('Cat D', false),
    ('Amazing', true),
    ('Historical', true),
    ('Ephemeral', true),
    ('Random', true),
    ('Sports', true),
    ('Scientific', true),
    ('Personal', true),
    ('Numerical', true),
    ('Movies', true),
    ('Comics', true),
    ('Media', true),
    ('37th things', true),
    ('Pictures', true),
    ('Sounds', true),
    ('Links', true),
    ('Multiples', true),
    ('OG Grand Fact', false)
;

INSERT INTO tag
VALUES
    (1, 1),
    (1, 5),
    (2, 2),
    (2, 3),
    (2, 5),
    (3, 1),
    (3, 5),
    (4, 2),
    (4, 5),
    (5, 5),
    (6, 4),
    (2, 4),
    (7, 3),
    (7, 4)
;

INSERT INTO attachment (factoid_id, link, type)
VALUES
    (1, 'https://example.com/document.pdf', 'pdf'),
    (2, 'https://example.com/image.jpg', 'image'),
    (3, 'https://example.com/video.mp4', 'video')
;
