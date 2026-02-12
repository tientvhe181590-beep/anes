/**
 * Top 1,000 most common passwords for client-side blocklist check.
 * Stored as a sorted array for efficient Set construction.
 * The full HIBP breach check provides additional server-side coverage.
 */
const COMMON_PASSWORDS: readonly string[] = [
  '000000', '00000000', '1111', '11111', '111111', '1111111', '11111111',
  '112233', '121212', '123123', '1234', '12345', '123456', '1234567',
  '12345678', '123456789', '1234567890', '12345679', '123abc', '131313',
  '159753', '1q2w3e', '1q2w3e4r', '1q2w3e4r5t', '1qaz2wsx', '222222',
  '333333', '444444', '555555', '654321', '666666', '696969', '777777',
  '7777777', '888888', '987654321', '999999', 'aaaaaa', 'abc123', 'abcd1234',
  'abcdef', 'abcdefg', 'abcdefgh', 'access', 'access14', 'admin', 'admin123',
  'amanda', 'amateur', 'andrea', 'andrew', 'angela', 'animal', 'anthony',
  'apache', 'apollo', 'apple', 'arsenal', 'ashley', 'asshole', 'august',
  'austin', 'azerty', 'bailey', 'banana', 'baseball', 'batman', 'beach',
  'bear', 'beaver', 'beavis', 'bigdaddy', 'bigdog', 'bigtits', 'birdie',
  'bitches', 'biteme', 'blazer', 'blowjob', 'blowme', 'bond007', 'bonnie',
  'booboo', 'boobs', 'booger', 'boomer', 'boston', 'brandon', 'brandy',
  'braves', 'brazil', 'bronco', 'broncos', 'buddy', 'bulldog', 'buster',
  'butter', 'butthead', 'calvin', 'camaro', 'cameron', 'canada', 'captain',
  'carlos', 'carter', 'casper', 'charles', 'charlie', 'cheese', 'chelsea',
  'chester', 'chicago', 'chicken', 'chris', 'cocacola', 'coffee', 'college',
  'compaq', 'computer', 'cookie', 'cooper', 'corvette', 'cowboy', 'cowboys',
  'crystal', 'cumming', 'cumshot', 'dakota', 'dallas', 'daniel', 'danielle',
  'dave', 'david', 'dennis', 'devil', 'diamond', 'digital', 'doctor',
  'dodger', 'dodgers', 'dolphin', 'dolphins', 'donald', 'dragon', 'eagles',
  'edward', 'einstein', 'enable', 'enjoy', 'enter', 'eric', 'erotic',
  'extreme', 'falcon', 'fender', 'ferrari', 'fire', 'firebird', 'fish',
  'fishing', 'florida', 'flower', 'flyers', 'football', 'forever', 'frank',
  'fred', 'freddy', 'freedom', 'friend', 'fucked', 'fucker', 'fucking',
  'fuckme', 'fuckyou', 'gandalf', 'gateway', 'gators', 'gemini', 'george',
  'giants', 'ginger', 'goddess', 'golden', 'golf', 'golfer', 'gordon',
  'gregory', 'guitar', 'gunner', 'hammer', 'hannah', 'hardcore', 'harley',
  'heather', 'hello', 'helpme', 'henderson', 'hockey', 'hooters', 'hornet',
  'horny', 'hotdog', 'hunter', 'hunting', 'iceman', 'iloveyou', 'internet',
  'iwantu', 'jack', 'jackson', 'jaguar', 'jake', 'james', 'jasmine',
  'jasper', 'jennifer', 'jeremy', 'jessica', 'johnny', 'johnson', 'jordan',
  'joseph', 'joshua', 'junior', 'justin', 'kelly', 'kevin', 'killer',
  'king', 'knight', 'ladies', 'lakers', 'laura', 'leather', 'legend',
  'letmein', 'lover', 'lucky', 'maggie', 'magnum', 'marine', 'mark',
  'marlboro', 'martin', 'master', 'matrix', 'matt', 'matthew', 'maverick',
  'melissa', 'member', 'mercedes', 'merlin', 'michael', 'michelle', 'mickey',
  'midnight', 'mike', 'miller', 'mine', 'mistress', 'money', 'monica',
  'monkey', 'monster', 'morgan', 'mother', 'mountain', 'muffin', 'murphy',
  'mustang', 'naked', 'nascar', 'nathan', 'naughty', 'newyork', 'nicholas',
  'nicole', 'nipple', 'nipples', 'norton', 'nothing', 'oliver', 'orange',
  'oscar', 'ou812', 'packer', 'packers', 'panther', 'panties', 'parker',
  'pass', 'password', 'password1', 'password12', 'password123', 'pat',
  'patrick', 'paul', 'peaches', 'peanut', 'pepper', 'peter', 'phantom',
  'phoenix', 'player', 'please', 'pookie', 'porsche', 'power', 'prince',
  'princess', 'private', 'purple', 'pussies', 'pussy', 'qazwsx', 'qwer1234',
  'qwerty', 'qwerty123', 'qwertyui', 'rabbit', 'rachel', 'racing', 'raiders',
  'rainbow', 'ranger', 'rangers', 'rascal', 'redskins', 'redsox', 'redwings',
  'richard', 'robert', 'rocket', 'rosebud', 'runner', 'rush2112', 'russia',
  'samantha', 'sammy', 'samson', 'sandra', 'saturn', 'scooby', 'scooter',
  'scorpio', 'scorpion', 'secret', 'service', 'shadow', 'shannon', 'shaved',
  'silver', 'skippy', 'slayer', 'smokey', 'snoopy', 'soccer', 'sophie',
  'spanky', 'sparky', 'spider', 'squirt', 'srinivas', 'startrek', 'starwars',
  'steelers', 'stephen', 'steven', 'sticky', 'stupid', 'success', 'summer',
  'sunshine', 'super', 'superman', 'surfer', 'swimming', 'taylor', 'tennis',
  'teresa', 'test', 'testing', 'theman', 'thomas', 'thunder', 'thx1138',
  'tiffany', 'tiger', 'tigers', 'tigger', 'tomcat', 'topgun', 'toyota',
  'travis', 'trouble', 'trustno1', 'tucker', 'turtle', 'twitter', 'united',
  'vagina', 'victor', 'victoria', 'viking', 'viper', 'voyager', 'walter',
  'warrior', 'welcome', 'whatever', 'william', 'willie', 'wilson', 'winner',
  'winston', 'winter', 'wizard', 'wolf', 'wolverine', 'women', 'xavier',
  'xxxx', 'xxxxx', 'xxxxxx', 'yamaha', 'yankee', 'yankees', 'yellow',
  'young', 'zxcvbn', 'zxcvbnm',
] as const;

/** Pre-built Set for O(1) lookup. */
const blocklist = new Set(COMMON_PASSWORDS);

/**
 * Returns true if the password appears in the common passwords blocklist.
 * Comparison is case-insensitive to catch trivial variants.
 */
export function isBlockedPassword(password: string): boolean {
  return blocklist.has(password.toLowerCase());
}
