const a = (name: string, animal: 'cat' | 'dog' | 'bird' | 'frog' | 'spider' | 'dragon' ) => ({ name, animal }) ;

const animals = [
  a('Fluffy', 'cat'),
  a('Rex', 'dog'),
  a('Mr. Nibbles', 'dragon'),
  a('Barky', 'bird'),
  a('Flame', 'dog'),
  a('Portugal guy', 'frog'),
  a('Badrinath', 'dog')
];

const isDog = (anything: { animal: Parameters<typeof a>[1] }) => anything.animal === 'dog';

console.log(
  "The dogs we have are as follows:\n",
  animals
    .filter(isDog)
    .map(dog => dog.name)
    .join(';\n')
);