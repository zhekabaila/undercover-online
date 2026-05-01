import { WordPair } from '../state/types.js';

export const wordPairs: WordPair[] = [
  { id: '1', civilian: 'Apel', undercover: 'Pir' },
  { id: '2', civilian: 'Kucing', undercover: 'Anjing' },
  { id: '3', civilian: 'Bola Basket', undercover: 'Bola Voli' },
  { id: '4', civilian: 'Kopi', undercover: 'Teh' },
  { id: '5', civilian: 'Dokter', undercover: 'Perawat' },
  { id: '6', civilian: 'Gitar', undercover: 'Biola' },
  { id: '7', civilian: 'Pantai', undercover: 'Gunung' },
  { id: '8', civilian: 'Susu', undercover: 'Yogurt' },
  { id: '9', civilian: 'Laptop', undercover: 'Tablet' },
  { id: '10', civilian: 'Matahari', undercover: 'Bulan' },
  { id: '11', civilian: 'Singa', undercover: 'Harimau' },
  { id: '12', civilian: 'Pizza', undercover: 'Burger' },
  { id: '13', civilian: 'Pesawat', undercover: 'Kereta Api' },
  { id: '14', civilian: 'Buku', undercover: 'Majalah' },
  { id: '15', civilian: 'Sepatu', undercover: 'Sandal' },
  { id: '16', civilian: 'Kemeja', undercover: 'Kaos' },
  { id: '17', civilian: 'Emas', undercover: 'Perak' },
  { id: '18', civilian: 'Laut', undercover: 'Danau' },
  { id: '19', civilian: 'Hujan', undercover: 'Salju' },
  { id: '20', civilian: 'Mawar', undercover: 'Melati' },
  { id: '21', civilian: 'Cokelat', undercover: 'Permen' },
  { id: '22', civilian: 'Bantal', undercover: 'Guling' },
  { id: '23', civilian: 'Senter', undercover: 'Lampu' },
  { id: '24', civilian: 'Jeruk', undercover: 'Lemon' },
  { id: '25', civilian: 'Bus', undercover: 'Truk' },
  { id: '26', civilian: 'Tas', undercover: 'Dompet' },
  { id: '27', civilian: 'Topi', undercover: 'Helm' },
  { id: '28', civilian: 'Sabun', undercover: 'Sampo' },
  { id: '29', civilian: 'Piring', undercover: 'Mangkuk' },
  { id: '30', civilian: 'Sendok', undercover: 'Garpu' },
  { id: '31', civilian: 'Pensil', undercover: 'Pulpen' },
  { id: '32', civilian: 'Meja', undercover: 'Kursi' },
  { id: '33', civilian: 'Pintu', undercover: 'Jendela' },
  { id: '34', civilian: 'Handphone', undercover: 'Telepon' },
  { id: '35', civilian: 'Kamera', undercover: 'Video' },
];

export function getRandomWordPair(): WordPair {
  return wordPairs[Math.floor(Math.random() * wordPairs.length)];
}

export function getWordPairById(id: string): WordPair | undefined {
  return wordPairs.find(wp => wp.id === id);
}
