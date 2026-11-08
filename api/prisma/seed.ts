import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const genreNames = ["Fantasy", "Science Fiction", "Mystery", "Romance"];

  const genres = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const genreIds = Object.fromEntries(
    genres.map((genre) => [genre.name, genre.id]),
  );

  const books = [
    ["The Hobbit", "J.R.R. Tolkien", "9780547928227", "Fantasy"],
    ["A Game of Thrones", "George R.R. Martin", "9780553593716", "Fantasy"],
    ["The Name of the Wind", "Patrick Rothfuss", "9780756404741", "Fantasy"],
    ["The Way of Kings", "Brandon Sanderson", "9780765326355", "Fantasy"],
    ["Dune", "Frank Herbert", "9780441172719", "Science Fiction"],
    ["1984", "George Orwell", "9780451524935", "Science Fiction"],
    ["Foundation", "Isaac Asimov", "9780553293357", "Science Fiction"],
    ["Fahrenheit 451", "Ray Bradbury", "9781451673319", "Science Fiction"],
    ["Gone Girl", "Gillian Flynn", "9780307588371", "Mystery"],
    ["The Silent Patient", "Alex Michaelides", "9781250301697", "Mystery"],
    ["The Girl with the Dragon Tattoo", "Stieg Larsson", "9780307454546", "Mystery"],
    ["And Then There Were None", "Agatha Christie", "9780062073488", "Mystery"],
    ["Pride and Prejudice", "Jane Austen", "9780141439518", "Romance"],
    ["Me Before You", "Jojo Moyes", "9780143124542", "Romance"],
    ["The Notebook", "Nicholas Sparks", "9781455582877", "Romance"],
    ["Jane Eyre", "Charlotte Bronte", "9780141441146", "Romance"],
  ];

  for (const [title, author, isbn, genre] of books) {
    await prisma.book.upsert({
      where: { isbn },
      update: {},
      create: {
        title,
        author,
        isbn,
        genreId: genreIds[genre],
      },
    });
  }

  console.log(`Seeded ${genres.length} genres and ${books.length} books.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
