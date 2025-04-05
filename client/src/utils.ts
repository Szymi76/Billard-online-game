// Zwraca 2-elementowe kombinacje bez powtorzen
// np. dla tablicy [a, b, c] => [[a, b], [b, c], [a, c]]
export function getCombinations<T>(array: T[]) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      result.push([array[i], array[j]]);
    }
  }

  return result;
}

// sprowadza dowolny kat do zakresu <0, 360>
// np. dla -390 => 330
// dodane, aby funkcja do sprawdzania czy kula jest poza stolem nie wywalala bledow
export function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

// sprawdza czy wartosc 'n' jest w przedziale <start, end>
// np. dla n = 10, start = 5, end = 15 funkcja zwraca true
export function between(n: number, start: number, end: number): boolean {
  return n >= start && n <= end;
}

// oblicza wspolrzedne punktu P2 majac punkt P1, kat oraz dlugosc
export function getPointFromAngle(
  x1: number,
  y1: number,
  angle: number,
  length: number
) {
  const angleRad = angle * (Math.PI / 180);
  const x2 = x1 + length * Math.cos(angleRad);
  const y2 = y1 + length * Math.sin(angleRad);
  return { x: x2, y: y2 };
}

// funkcja do czekania wybrana ilosc czasu
export function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
