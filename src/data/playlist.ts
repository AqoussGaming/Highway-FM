export type Category =
  | 'ALL'
  | '90S'
  | 'EARLY 2000S'
  | 'KUMAR SANU'
  | 'ROAD TRIP'
  | 'ROMANTIC'
  | 'CLASSIC'
  | 'NIGHT DRIVE';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  /** YouTube video ID for real playback. Leave null until a licensed source is configured. */
  youtubeId: string | null;
  /** Local/hosted audio file path, e.g. "/music/song.mp3". Leave null until provided. */
  audioSrc: string | null;
  /** Approximate duration in seconds — used for demo playback and progress display. */
  duration: number;
  /** Hue used to generate a stylized cassette-art placeholder (0-360). */
  artworkHue: number;
  categories: Category[];
}

// Duration is an editorial estimate (typical era runtime) shown until a real
// source (YouTube ID or hosted file) supplies an exact figure.
const DEFAULT_DURATION = 275; // 4:35

let hueSeed = 14;
function nextHue(): number {
  hueSeed = (hueSeed + 41) % 360;
  return hueSeed;
}

function track(
  title: string,
  artist: string,
  album: string,
  year: number,
  categories: Category[],
  duration = DEFAULT_DURATION
): Track {
  return {
    id: `${title}-${album}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    artist,
    album,
    year,
    youtubeId: null,
    audioSrc: null,
    duration,
    artworkHue: nextHue(),
    categories: ['ALL', ...categories],
  };
}

// Primary rotation — the 30-track set the player opens with.
export const PLAYLIST: Track[] = [
  track('Aankhon Se Tune Kya Keh Diya', 'Kumar Sanu, Alka Yagnik', 'Ghulam', 1998, ['90S', 'KUMAR SANU', 'ROMANTIC']),
  track('Aankhon Mein Base Ho Tum', 'Abhijeet, Alka Yagnik', 'Takkar', 1995, ['90S', 'ROMANTIC']),
  track('Ae Ajnabi', 'Udit Narayan, Mahalaxmi', 'Dil Se', 1998, ['90S', 'NIGHT DRIVE', 'ROAD TRIP']),
  track('Kaho Naa Pyaar Hai', 'Udit Narayan, Alka Yagnik', 'Kaho Naa... Pyaar Hai', 2000, ['EARLY 2000S', 'ROMANTIC']),
  track('Kaho Naa Pyaar Hai (Title Track)', 'Udit Narayan', 'Kaho Naa... Pyaar Hai', 2000, ['EARLY 2000S']),
  track('Tujhe Dekha To', 'Kumar Sanu, Lata Mangeshkar', 'Dilwale Dulhania Le Jayenge', 1995, ['90S', 'CLASSIC', 'KUMAR SANU']),
  track('Pehla Nasha', 'Udit Narayan, Sadhana Sargam', 'Jo Jeeta Wohi Sikandar', 1992, ['90S', 'CLASSIC', 'ROMANTIC']),
  track('Tu Hi Meri Shab Hai', 'KK', 'Gangster', 2006, ['EARLY 2000S', 'NIGHT DRIVE', 'ROMANTIC']),
  track('Woh Ladki Hai Kahan', 'Shaan, Kavita Krishnamurthy', 'Dil Chahta Hai', 2001, ['EARLY 2000S', 'ROAD TRIP']),
  track('Kya Mujhe Pyaar Hai', 'KK', 'Woh Lamhe', 2006, ['EARLY 2000S', 'ROMANTIC']),
  track('Aadat', 'Atif Aslam', 'Kalyug', 2005, ['EARLY 2000S', 'NIGHT DRIVE']),
  track('Ya Ali', 'Zubeen Garg', 'Gangster', 2006, ['EARLY 2000S', 'ROAD TRIP']),
  track('Zara Zara', 'Bombay Jayashri', 'Rehnaa Hai Terre Dil Mein', 2001, ['EARLY 2000S', 'ROMANTIC', 'NIGHT DRIVE']),
  track('Sach Keh Raha Hai Deewana', 'KK', 'Rehnaa Hai Terre Dil Mein', 2001, ['EARLY 2000S']),
  track('Dil Ko Tumse Pyaar Hua', 'Roop Kumar Rathod', 'Rehnaa Hai Terre Dil Mein', 2001, ['EARLY 2000S', 'ROMANTIC']),
  track('Kaho Naa Pyaar Hai (Chand Sitare)', 'Udit Narayan, Alka Yagnik', 'Kaho Naa... Pyaar Hai', 2000, ['EARLY 2000S']),
  track('Aankhon Mein Teri', 'KK', 'Om Shanti Om', 2007, ['EARLY 2000S', 'ROMANTIC']),
  track('Woh Pehli Baar', 'Shaan', 'Pyaar Mein Kabhi Kabhi', 1999, ['90S', 'ROMANTIC']),
  track('Ek Ladki Ko Dekha', 'Kumar Sanu', '1942: A Love Story', 1994, ['90S', 'CLASSIC', 'KUMAR SANU']),
  track('Ghar Se Nikalte Hi', 'Udit Narayan', 'Papa Kehte Hain', 1996, ['90S', 'ROAD TRIP']),
  track('Do Dil Mil Rahe Hain', 'Kumar Sanu', 'Pardes', 1997, ['90S', 'KUMAR SANU', 'ROMANTIC']),
  track('Tum Mile', 'Neeraj Shridhar, Tulsi Kumar', 'Tum Mile', 2009, ['NIGHT DRIVE', 'ROMANTIC']),
  track('Tu Jaane Na', 'Atif Aslam', 'Ajab Prem Ki Ghazab Kahani', 2009, ['ROMANTIC', 'NIGHT DRIVE']),
  track('Tera Hone Laga Hoon', 'Atif Aslam, Alisha Chinai', 'Ajab Prem Ki Ghazab Kahani', 2009, ['ROMANTIC']),
  track('Main Agar Kahoon', 'Sonu Nigam, Shreya Ghoshal', 'Om Shanti Om', 2007, ['EARLY 2000S', 'ROMANTIC']),
  track('Ajab Si', 'KK', 'Om Shanti Om', 2007, ['EARLY 2000S', 'NIGHT DRIVE']),
  track('Tere Bin', 'Atif Aslam', 'Bas Ek Pal', 2006, ['EARLY 2000S', 'ROMANTIC']),
  track('Aao Milo Chalo', 'Shaan, Ustad Sultan Khan', 'Jab We Met', 2007, ['ROAD TRIP', 'EARLY 2000S']),
  track('Safarnama', 'Mohit Chauhan', 'Tamasha', 2015, ['ROAD TRIP', 'NIGHT DRIVE']),
];

// Extended library used by the playlist panel's category filters. Every
// entry follows the same metadata contract as PLAYLIST above.
export const LIBRARY: Track[] = [
  ...PLAYLIST,
  track('Mujhse Mohabbat Ka', 'Kumar Sanu, Alka Yagnik', 'Deewana', 1992, ['90S', 'KUMAR SANU', 'ROMANTIC']),
  track('Tumsa Koi Pyaara', 'Kumar Sanu, Alka Yagnik', 'Deewana', 1992, ['90S', 'KUMAR SANU']),
  track('Pehli Pehli Baar Mohabbat Ki Hai', 'Kumar Sanu, Alka Yagnik', 'Deewana', 1992, ['90S', 'KUMAR SANU', 'ROMANTIC']),
  track('Saaton Janam Main Tere', 'Kumar Sanu, Alka Yagnik', 'Deewana', 1992, ['90S', 'KUMAR SANU']),
  track('Tumhein Apna Banane Ki Kasam', 'Kumar Sanu', 'Baazigar', 1993, ['90S', 'KUMAR SANU', 'ROMANTIC']),
  track('Bahut Pyar Karte Hain', 'Anuradha Paudwal', 'Saajan', 1991, ['90S', 'CLASSIC']),
  track('Aaye Ho Meri Zindagi Mein', 'Udit Narayan', 'Raja Hindustani', 1996, ['90S', 'ROMANTIC']),
  track('Barsaat Ke Mausam Mein', 'Kumar Sanu, Roop Kumar Rathod', 'Barsaat', 1995, ['90S', 'KUMAR SANU', 'NIGHT DRIVE']),
  track('Mera Dil Bhi Kitna Pagal Hai', 'Kumar Sanu, Alka Yagnik', 'Saajan', 1991, ['90S', 'KUMAR SANU']),
  track('Pardesi Pardesi', 'Udit Narayan, Alka Yagnik', 'Raja Hindustani', 1996, ['90S', 'ROAD TRIP']),
  track('Dil Hai Ke Manta Nahin', 'Kumar Sanu, Anuradha Paudwal', 'Dil Hai Ke Manta Nahin', 1991, ['90S', 'KUMAR SANU', 'CLASSIC']),
  track('Honton Pe Bas', 'Lata Mangeshkar, Kumar Sanu', 'Sadak', 1991, ['90S', 'KUMAR SANU', 'CLASSIC']),
  track('Musafir Hoon Yaaron', 'Kishore Kumar', 'Parichay', 1972, ['CLASSIC', 'ROAD TRIP']),
  track('Zindagi Ek Safar Hai Suhana', 'Kishore Kumar', 'Andaz', 1971, ['CLASSIC', 'ROAD TRIP']),
  track('Hum Jo Chalne Lage', 'Shaan, KK', 'Jab We Met', 2007, ['EARLY 2000S', 'ROAD TRIP']),
  track('Khaabon Ke Parinday', 'Alyssa Mendonsa, Mohit Chauhan', 'Zindagi Na Milegi Dobara', 2011, ['ROAD TRIP', 'NIGHT DRIVE']),
  track('Dil Chahta Hai', 'Shankar Mahadevan', 'Dil Chahta Hai', 2001, ['EARLY 2000S', 'ROAD TRIP']),
  track('Patli Kamar', 'Lucky Ali', 'Sur', 2002, ['EARLY 2000S']),
  track('O Sanam', 'Lucky Ali', 'Sunoh', 2000, ['EARLY 2000S', 'ROMANTIC']),
  track('Na Tum Jaano Na Hum', 'Lucky Ali', 'Kaho Naa... Pyaar Hai', 2000, ['EARLY 2000S', 'ROMANTIC', 'NIGHT DRIVE']),
  track('Tanha Dil', 'Shaan', 'Tanha Dil', 2001, ['EARLY 2000S', 'NIGHT DRIVE']),
  track('Iktara', 'Kavita Seth', 'Wake Up Sid', 2009, ['ROMANTIC', 'NIGHT DRIVE']),
  track('In Dino', 'Soham Chakraborty', 'Life in a Metro', 2007, ['NIGHT DRIVE']),
  track('Jaadu Hai Nasha Hai', 'Shreya Ghoshal', 'Jism', 2003, ['EARLY 2000S', 'ROMANTIC']),
  track('Toh Phir Aao', 'Mustafa Zahid', 'Awarapan', 2007, ['EARLY 2000S', 'NIGHT DRIVE']),
  track('Maahi', 'Toshi Sabri', 'Ghajini', 2008, ['ROMANTIC']),
  track('Gulabi Aankhen', 'Mohammed Rafi', 'The Train', 1970, ['CLASSIC']),
  track('Pal Pal Dil Ke Paas', 'Kishore Kumar', 'Blackmail', 1973, ['CLASSIC', 'ROMANTIC']),
  track('Neele Neele Ambar Par', 'Kishore Kumar', 'Kalakaar', 1980, ['CLASSIC', 'NIGHT DRIVE']),
  track('Mere Sapno Ki Rani', 'Kishore Kumar', 'Aradhana', 1969, ['CLASSIC', 'ROAD TRIP']),
  track('Roop Tera Mastana', 'Kishore Kumar', 'Aradhana', 1969, ['CLASSIC', 'NIGHT DRIVE']),
  track('Yeh Shaam Mastani', 'Kishore Kumar', 'Kati Patang', 1970, ['CLASSIC', 'NIGHT DRIVE']),
  track('Chura Ke Dil Mera', 'Alka Yagnik, Kumar Sanu', 'Main Khiladi Tu Anari', 1994, ['90S', 'KUMAR SANU']),
  track('Chhupana Bhi Nahi Aata', 'Pankaj Udhas', 'Baazigar', 1993, ['90S', 'ROMANTIC']),
];

export function trackById(id: string): Track | undefined {
  return LIBRARY.find((t) => t.id === id);
}
