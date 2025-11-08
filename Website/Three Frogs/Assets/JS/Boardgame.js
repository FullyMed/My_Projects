// ===============================
// JS for index.html
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("boardgame-list");
  const seeMoreBox = document.getElementById("seeMoreBox");
  const viewMorePrompt = document.getElementById("viewMorePrompt");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  const boardgames = [
    {
      name: "Catan",
      category: "Strategy",
      players: "3-4",
      duration: "60 min",
      image: "Assets/Images/Catan.jpg",
      description: "Trade, build, and settle your way to victory!",
      tags: ["Resource Management", "Trading", "Dice Rolling"]
    },
    {
      name: "Monopoly",
      category: "Family",
      players: "2-6",
      duration: "120 min",
      image: "Assets/Images/Monopoly.avif",
      description: "Buy, trade, and bankrupt your opponents!",
      tags: ["Roll and Move", "Economic", "Player Elimination"]
    },
    {
      name: "Carcassonne",
      category: "Family",
      players: "2-5",
      duration: "45 min",
      image: "Assets/Images/Carcassonne.jpg",
      description: "Build cities and claim roads with strategic tiles.",
      tags: ["Tile Placement", "Area Control"]
    },
    {
      name: "Codenames",
      category: "Word Game",
      players: "4-8",
      duration: "15 min",
      image: "Assets/Images/Codenames.jpg",
      description: "Guess the secret words using clever clues.",
      tags: ["Team-Based", "Communication", "Deduction"]
    },
    {
      name: "Ticket to Ride",
      category: "Family",
      players: "2-5",
      duration: "60 min",
      image: "Assets/Images/Ticket to Ride.jpg",
      description: "Collect train cards to claim routes across the map.",
      tags: ["Route Building", "Set Collection"]
    },
    {
      name: "Pandemic",
      category: "Cooperative",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Pandemic.webp",
      description: "Work together to stop global outbreaks!",
      tags: ["Action Point Allowance", "Hand Management", "Player Powers"]
    },
    {
      name: "Pandemic: Rapid Response",
      category: "Cooperative",
      players: "2-4",
      duration: "20 min",
      image: "Assets/Images/Pandemic Rapid Response.jpg",
      description: "Deliver aid to cities in crisis in this real-time dice-rolling spinoff of Pandemic.",
      tags: ["Real-Time", "Dice Rolling", "Crisis Management"]
    },
    {
      name: "Azul",
      category: "Abstract",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Azul.jpg",
      description: "Draft tiles to create stunning mosaic patterns.",
      tags: ["Pattern Building", "Drafting"]
    },
    {
      name: "7 Wonders",
      category: "Strategy",
      players: "3-7",
      duration: "30 min",
      image: "Assets/Images/7 Wonders.jpg",
      description: "Build an ancient city through science, war, and trade.",
      tags: ["Card Drafting", "Set Collection", "Engine Building"]
    },
    {
      name: "7 Wonders Duel",
      category: "Card Game",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/7 Wonders Duel.webp",
      description: "A strategic head-to-head version of 7 Wonders with new twists and mechanics.",
      tags: ["Card Drafting", "Two Player", "Civ Building"]
    },
    {
      name: "Exploding Kittens",
      category: "Party",
      players: "2-5",
      duration: "15 min",
      image: "Assets/Images/Exploding Kittens.jpg",
      description: "A fast and hilarious game of feline destruction.",
      tags: ["Player Elimination", "Push Your Luck"]
    },
    {
      name: "Dixit",
      category: "Party",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/Dixit.jpg",
      description: "Use imagination to match beautiful surreal cards.",
      tags: ["Storytelling", "Voting", "Creativity"]
    },
    {
      name: "Jenga",
      category: "Dexterity",
      players: "1-8",
      duration: "15-20 min",
      image: "Assets/Images/Jenga.jpg",
      description: "Pull and stack wooden blocks without toppling the tower!",
      tags: ["Stacking", "Tension", "Hand-Eye Coordination"]
    },
    {
      name: "Welcome to Your Perfect Home",
      category: "Family",
      players: "1-100",
      duration: "25 min",
      image: "Assets/Images/Welcome to Your Perfect Home.jpg",
      description: "Plan the perfect suburban neighborhood with clever number placement.",
      tags: ["Flip and Write", "Number Placement"]
    },
    {
      name: "Wingspan",
      category: "Strategy",
      players: "1-5",
      duration: "40-70 min",
      image: "Assets/Images/Wingspan.jpg",
      description: "Attract birds and build powerful combos in a beautiful engine-building game.",
      tags: ["Engine Building", "Card Drafting", "Set Collection"]
    },
    {
      name: "Risk",
      category: "Strategy",
      players: "2-6",
      duration: "60-120 min",
      image: "Assets/Images/Risk.jpg",
      description: "Conquer the world one territory at a time through dice and strategy.",
      tags: ["Area Control", "Dice Rolling", "Elimination"]
    },
    {
      name: "Risk Europe",
      category: "Strategy",
      players: "2-4",
      duration: "120 min",
      image: "Assets/Images/Risk Europe.jpg",
      description: "Command medieval armies and use tactics and economy to dominate Europe.",
      tags: ["Area Control", "Dice Rolling", "War Game"]
    },
    {
      name: "Patchwork",
      category: "Abstract",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/Patchwork.jpg",
      description: "Compete to build the most aesthetically pleasing quilt using Tetris-like pieces.",
      tags: ["Tile Placement", "Tetris-Like", "Resource Management"]
    },
    {
      name: "Secret Hitler",
      category: "Party",
      players: "5-10",
      duration: "45 min",
      image: "Assets/Images/Secret Hitler.jpg",
      description: "Deduce who is lying in this tense and strategic political thriller.",
      tags: ["Hidden Roles", "Bluffing", "Deduction"]
    },
    {
      name: "Camel Up",
      category: "Party",
      players: "2-8",
      duration: "30 min",
      image: "Assets/Images/Camel Up.webp",
      description: "Bet on racing camels and manipulate their positions in wild ways!",
      tags: ["Betting", "Racing", "Dice Rolling"]
    },
    {
      name: "Splendor",
      category: "Strategy",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Splendor.jpg",
      description: "Collect gems and attract nobles in this elegant and strategic game.",
      tags: ["Engine Building", "Set Collection", "Card Drafting"]
    },
    {
      name: "Splendor Duel",
      category: "Card Game",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/Splendor Duel.jpg",
      description: "A tense and tactical two-player twist on the classic Splendor engine-building game.",
      tags: ["Engine Building", "Card Drafting", "Two Player"]
    },
    {
      name: "That's You",
      category: "Party",
      players: "2-6",
      duration: "20-60 min",
      image: "Assets/Images/Thats You.png",
      description: "Answer hilarious personal questions and see how well you know your friends.",
      tags: ["Social", "Mobile Integration", "Humor"]
    },
    {
      name: "Forest Shuffle",
      category: "Strategy",
      players: "2-4",
      duration: "40-60 min",
      image: "Assets/Images/Forest Shuffle.jpg",
      description: "Grow a thriving forest by strategically layering trees, animals, and plants.",
      tags: ["Card Drafting", "Nature-Themed", "Set Collection"]
    },
    {
      name: "Happy Salmon",
      category: "Party",
      players: "3-6",
      duration: "2-5 min",
      image: "Assets/Images/Happy Salmon.png",
      description: "Frantic, fast-paced fun where players race to perform silly actions and ditch their cards.",
      tags: ["Real-Time", "Party Game", "High Energy"]
    },    
    {
      name: "Love Letter",
      category: "Card Game",
      players: "2-4",
      duration: "20 min",
      image: "Assets/Images/Love Letter.jpg",
      description: "Use deduction and luck to deliver your love letter to the princess.",
      tags: ["Hand Management", "Deduction", "Player Elimination"]
    },
    {
      name: "King of Tokyo",
      category: "Party",
      players: "2-6",
      duration: "30 min",
      image: "Assets/Images/King of Tokyo.jpg",
      description: "Battle monsters and roll dice to become the one and only King of Tokyo!",
      tags: ["Dice Rolling", "Player Elimination", "Push Your Luck"]
    },
    {
      name: "Tokaido",
      category: "Family",
      players: "2-5",
      duration: "45 min",
      image: "Assets/Images/Tokaido.jpg",
      description: "Take a peaceful journey through Japan, collecting souvenirs and experiences.",
      tags: ["Point to Point Movement", "Set Collection", "Relaxing"]
    },
    {
      name: "The Mind",
      category: "Party",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/The Mind.jpg",
      description: "Play cards in the right order—without talking. A game of timing and connection.",
      tags: ["Cooperative", "Hand Management", "Timing"]
    },
    {
      name: "Cluedo",
      category: "Family",
      players: "3-6",
      duration: "45 min",
      image: "Assets/Images/Cluedo.jpg",
      description: "Solve the murder mystery by deducing who, where, and with what.",
      tags: ["Deduction", "Roll and Move", "Mystery"]
    },
    {
      name: "Onitama",
      category: "Abstract",
      players: "2",
      duration: "15-20 min",
      image: "Assets/Images/Onitama.jpg",
      description: "A fast-paced strategy game with martial arts-inspired movement patterns.",
      tags: ["Abstract Strategy", "Perfect Information", "Grid Movement"]
    },
    {
      name: "Terraforming Mars",
      category: "Strategy",
      players: "1-5",
      duration: "120 min",
      image: "Assets/Images/Terraforming Mars.jpg",
      description: "Lead a corporation to terraform the red planet through engine building and resource management.",
      tags: ["Engine Building", "Card Drafting", "Resource Management"]
    },
    {
      name: "Terraforming Mars: Ares Expedition",
      category: "Strategy",
      players: "1-4",
      duration: "45-75 min",
      image: "Assets/Images/Terraforming Mars Ares.jpg",
      description: "A faster, card-based take on Terraforming Mars with streamlined mechanics.",
      tags: ["Engine Building", "Card Game", "Science Fiction"]
    },
    {
      name: "Coup",
      category: "Bluffing",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Coup.jpg",
      description: "Use deception, deduction, and strategy to manipulate your way to power.",
      tags: ["Bluffing", "Player Elimination", "Hidden Roles"]
    },
    {
      name: "Wavelength",
      category: "Party",
      players: "2-12",
      duration: "30-45 min",
      image: "Assets/Images/Wavelength.jpg",
      description: "Give and guess clues on a hidden spectrum in this hilarious team game.",
      tags: ["Team-Based", "Communication", "Social"]
    },
    {
      name: "Great Western Trail",
      category: "Strategy",
      players: "2-4",
      duration: "75-150 min",
      image: "Assets/Images/Great Western Trail.webp",
      description: "Herd cattle, upgrade your engine, and build your legacy in the Old West.",
      tags: ["Deck-Building", "Route Building", "Economic"]
    },
    {
      name: "The Crew: The Quest for Planet Nine",
      category: "Cooperative",
      players: "2-5",
      duration: "20 min",
      image: "Assets/Images/The Crew_Planet Nine.jpg",
      description: "Complete tricky space missions with limited communication in this cooperative trick-taking game.",
      tags: ["Trick-Taking", "Mission-Based", "Limited Communication"]
    },
    {
      name: "Spyfall",
      category: "Bluffing",
      players: "3-8",
      duration: "15 min",
      image: "Assets/Images/Spyfall.webp",
      description: "Find the spy among you—or if you're the spy, figure out where you are!",
      tags: ["Social Deduction", "Bluffing", "Hidden Roles"]
    },
    {
      name: "Menace Among Us",
      category: "Bluffing",
      players: "4-8",
      duration: "45-60 min",
      image: "Assets/Images/Menace Among Us.jpg",
      description: "A hidden traitor game set in space where players work to fix their ship—or sabotage it.",
      tags: ["Hidden Roles", "Deduction", "Cooperative", "Bluffing"]
    },
    {
      name: "Hellapagos",
      category: "Cooperative",
      players: "3-12",
      duration: "20-30 min",
      image: "Assets/Images/Hellapagos.jpg",
      description: "Survive a shipwrecked island by working together... until resources run out!",
      tags: ["Cooperative", "Survival", "Negotiation", "Backstabbing"]
    },
    {
      name: "Dream Home",
      category: "Family",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Dream Home.jpg",
      description: "Design your ideal house by choosing cards and furnishing each room with style.",
      tags: ["Set Collection", "Drafting", "Family Friendly"]
    },
    {
      name: "Baobab",
      category: "Dexterity",
      players: "2-4",
      duration: "15 min",
      image: "Assets/Images/Baobab.jpg",
      description: "Stack animals on a tree without letting them fall. Each type has a different rule!",
      tags: ["Stacking", "Animal Theme", "Party"]
    },
    {
      name: "Tapestry",
      category: "Strategy",
      players: "1-5",
      duration: "90-120 min",
      image: "Assets/Images/Tapestry.jpg",
      description: "Advance your civilization through eras of innovation and conquest in this grand strategy game.",
      tags: ["Civilization Building", "Engine Building", "Asymmetric Powers"]
    },
    {
      name: "Everdell",
      category: "Strategy",
      players: "1-4",
      duration: "40-80 min",
      image: "Assets/Images/Everdell.png",
      description: "Build a vibrant woodland city with critters and constructions in this beautiful tableau game.",
      tags: ["Worker Placement", "Tableau Building", "Card Drafting"]
    },
    {
      name: "Downforce",
      category: "Family",
      players: "2-6",
      duration: "30-45 min",
      image: "Assets/Images/Downforce.jpg",
      description: "Bid, race, and bet in a fast-paced Formula 1 style board game.",
      tags: ["Betting", "Hand Management", "Racing"]
    },
    {
      name: "My City",
      category: "Family",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/My City.jpg",
      description: "A legacy tile-laying game where players build a city that evolves over time.",
      tags: ["Legacy", "Tile Placement", "City Building"]
    },
    {
      name: "Barenpark",
      category: "Family",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Barenpark.jpeg",
      description: "Build your own bear park by placing polyomino tiles to maximize space.",
      tags: ["Tile Placement", "Tetris-Like", "Set Collection"]
    },
    {
      name: "Blue Lagoon",
      category: "Family",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Blue Lagoon.webp",
      description: "Explore islands and settle in this strategic area control game.",
      tags: ["Area Control", "Set Collection", "Abstract"]
    },
    {
      name: "Reef",
      category: "Abstract",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Reef.jpg",
      description: "Create colorful coral patterns in a vibrant underwater setting.",
      tags: ["Pattern Building", "Stacking", "Family Friendly"]
    },
    {
      name: "Wombat",
      category: "Family",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Wombat.jpg",
      description: "Help wombats dig and navigate their tunnels in this cute and clever game.",
      tags: ["Animal Theme", "Movement", "Kids"]
    },
    {
      name: "Marrakech",
      category: "Abstract",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Marrakech.jpg",
      description: "Place your carpets on the market and earn the most money in this tactical game.",
      tags: ["Tile Placement", "Area Influence", "Economic"]
    },
    {
      name: "Dragon Market",
      category: "Family",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Dragon Market.jpg",
      description: "Collect items by moving through a dynamic floating market filled with shifting boats.",
      tags: ["Grid Movement", "Pickup and Deliver", "Strategy"]
    },
    {
      name: "Quixo",
      category: "Abstract",
      players: "2 or 4",
      duration: "15-20 min",
      image: "Assets/Images/Quixo.webp",
      description: "Align five of your symbols in a row by pushing and rotating blocks.",
      tags: ["Abstract Strategy", "Alignment", "Quick Play"]
    },
    {
      name: "Pylos",
      category: "Abstract",
      players: "2",
      duration: "20 min",
      image: "Assets/Images/Pylos.jpeg",
      description: "Stack your spheres to complete the pyramid while conserving your pieces.",
      tags: ["Abstract Strategy", "3D", "Tactical"]
    },
    {
      name: "Quoridor",
      category: "Abstract",
      players: "2-4",
      duration: "15-30 min",
      image: "Assets/Images/Quoridor.jpg",
      description: "Block your opponents and be the first to reach the other side of the board.",
      tags: ["Maze", "Blocking", "Abstract Strategy"]
    },
    {
      name: "Game of Cat and Mouth",
      category: "Dexterity",
      players: "2",
      duration: "10-15 min",
      image: "Assets/Images/Game of Cat and Mouth.webp",
      description: "Use a magnetic cat paw to fling balls at your opponent's side in a fast-paced battle.",
      tags: ["Flicking", "Dexterity", "Real-Time"]
    },
    {
      name: "Blokus",
      category: "Abstract",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Blokus.webp",
      description: "Place as many of your pieces as you can while blocking your opponents in this strategic spatial game.",
      tags: ["Tile Placement", "Spatial Reasoning", "Abstract Strategy"]
    },
    {
      name: "Jaipur",
      category: "Card Game",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/Jaipur.jpg",
      description: "A fast-paced card game of trading and tactics set in the Indian marketplace.",
      tags: ["Trading", "Set Collection", "Hand Management"]
    },
    {
      name: "Schotten Totten",
      category: "Card Game",
      players: "2",
      duration: "20 min",
      image: "Assets/Images/Schotten Totten.jpeg",
      description: "Battle over stones using poker-style formations in this tactical 2-player duel.",
      tags: ["Hand Management", "Area Control", "Bluffing"]
    },
    {
      name: "Tacocat Spelled Backwards",
      category: "Party",
      players: "2",
      duration: "15-20 min",
      image: "Assets/Images/Tacocat Spelled Backwards.webp",
      description: "A palindrome-powered tug-of-war game of clever duels and bluffing.",
      tags: ["Bluffing", "Card Game", "Humor"]
    },
    {
      name: "Raise Your Goblets",
      category: "Bluffing",
      players: "2-12",
      duration: "30-45 min",
      image: "Assets/Images/Raise Your Goblets.jpg",
      description: "Mix, poison, and toast as you try to eliminate your enemies without getting caught.",
      tags: ["Bluffing", "Deduction", "Party"]
    },
    {
      name: "Kingdomino",
      category: "Family",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Kingdomino.jpg",
      description: "Match and build your kingdom in this domino-style tile-laying game.",
      tags: ["Tile Placement", "Drafting", "Spatial"]
    },
    {
      name: "Cacao",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Cacao.webp",
      description: "Grow and sell cacao in this tile-laying game of timing and resource management.",
      tags: ["Tile Placement", "Resource Management", "Economic"]
    },
    {
      name: "Game of Life",
      category: "Family",
      players: "2-6",
      duration: "60 min",
      image: "Assets/Images/Game of Life.jpeg",
      description: "Travel through life making choices about career, family, and fortune in this classic game.",
      tags: ["Roll and Move", "Life Simulation", "Classic"]
    },
    {
      name: "Dream On",
      category: "Party",
      players: "2-8",
      duration: "20 min",
      image: "Assets/Images/Dream On.jpeg",
      description: "Build a dream together, then try to recall it in the right order!",
      tags: ["Memory", "Storytelling", "Cooperative"]
    },
    {
      name: "Bang! The Dice Game",
      category: "Party",
      players: "3-8",
      duration: "15-20 min",
      image: "Assets/Images/Bang The Dice.jpg",
      description: "A faster version of Bang! with dice-rolling and hidden roles.",
      tags: ["Dice Rolling", "Hidden Roles", "Bluffing"]
    },
    {
      name: "Bang! The Bullet",
      category: "Party",
      players: "3-8",
      duration: "20-40 min",
      image: "Assets/Images/Bang The Bullet.webp",
      description: "A deluxe edition of the wild west shootout game—hidden roles, bluffing, and bullets fly.",
      tags: ["Bluffing", "Hidden Roles", "Western"]
    },
    {
      name: "Fun Facts",
      category: "Party",
      players: "4-8",
      duration: "20-30 min",
      image: "Assets/Images/Fun Facts.jpg",
      description: "Reveal hilarious and surprising facts about your friends in this light party game.",
      tags: ["Guessing", "Social", "Icebreaker"]
    },
    {
      name: "Concept",
      category: "Party",
      players: "4-12",
      duration: "40 min",
      image: "Assets/Images/Concept.webp",
      description: "Use icons to get your teammates to guess words or phrases in this abstract communication game.",
      tags: ["Word Game", "Abstract", "Team-Based"]
    },
    {
      name: "Go Cuckoo",
      category: "Dexterity",
      players: "2-5",
      duration: "15 min",
      image: "Assets/Images/Go Cuckoo.jpg",
      description: "Build a nest from sticks and carefully place eggs without making them fall.",
      tags: ["Dexterity", "Balancing", "Kids"]
    },
    {
      name: "Take 6",
      category: "Card Game",
      players: "2-10",
      duration: "30 min",
      image: "Assets/Images/Take 6.jpg",
      description: "Avoid collecting cards with bullheads in this fast-paced number game.",
      tags: ["Hand Management", "Number Game", "Set Collection"]
    },
    {
      name: "Spirits of the Forest",
      category: "Abstract",
      players: "1-4",
      duration: "20-30 min",
      image: "Assets/Images/Spirits of the Forest.webp",
      description: "Collect sets of spirit tiles while managing resources and blocking opponents.",
      tags: ["Set Collection", "Abstract Strategy", "Tile Drafting"]
    },
    {
      name: "Skull",
      category: "Bluffing",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/Skull.jpg",
      description: "A bluffing game of risk and deception using coasters with flowers and skulls.",
      tags: ["Bluffing", "Risk Management", "Deduction"]
    },
    {
      name: "Room 25",
      category: "Thematic",
      players: "1-6",
      duration: "30-60 min",
      image: "Assets/Images/Room 25.webp",
      description: "Escape a deadly maze filled with traps, suspicion, and betrayal.",
      tags: ["Hidden Traitor", "Modular Board", "Action Programming"]
    },
    {
      name: "Ramen Fury",
      category: "Card Game",
      players: "2-5",
      duration: "15-20 min",
      image: "Assets/Images/Ramen Fury.webp",
      description: "Build the tastiest bowls of ramen by drafting ingredients and seasoning wisely.",
      tags: ["Drafting", "Set Collection", "Food Theme"]
    },
    {
      name: "Bag of Chips",
      category: "Party",
      players: "2-5",
      duration: "20 min",
      image: "Assets/Images/Bag of Chips.webp",
      description: "Bet on outcomes and crunch your way to victory in this push-your-luck snack game.",
      tags: ["Betting", "Push Your Luck", "Drafting"]
    },
    {
      name: "Waroong Wars",
      category: "Family",
      players: "2-5",
      duration: "30-45 min",
      image: "Assets/Images/Waroong Wars.png",
      description: "Build your food stall empire and serve customers in this flavorful Indonesian-themed game.",
      tags: ["Resource Management", "Set Collection", "Local Theme"]
    },
    {
      name: "Cabo",
      category: "Card Game",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Cabo.jpg",
      description: "A memory and deduction game where the goal is to have the lowest score by game end.",
      tags: ["Memory", "Deduction", "Card Game"]
    },
    {
      name: "Subastral",
      category: "Strategy",
      players: "2-5",
      duration: "30-45 min",
      image: "Assets/Images/Subastral.png",
      description: "Explore the biomes of Earth while drafting cards to complete your journal.",
      tags: ["Set Collection", "Drafting", "Nature Theme"]
    },
    {
      name: "Inside Job",
      category: "Bluffing",
      players: "3-5",
      duration: "20 min",
      image: "Assets/Images/Inside Job.webp",
      description: "A hidden role game where an agent blends in with coworkers while sabotaging missions.",
      tags: ["Hidden Roles", "Deduction", "Cooperative"]
    },
    {
      name: "Boy Who Cried Wolf",
      category: "Party",
      players: "3-6",
      duration: "15-20 min",
      image: "Assets/Images/Boy Who Cried Wolf.webp",
      description: "A storytelling and bluffing game based on the classic fable.",
      tags: ["Bluffing", "Storytelling", "Family"]
    },
    {
      name: "Dice Academy",
      category: "Party",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Dice Academy.jpg",
      description: "Match categories with letters as fast as you can using custom dice.",
      tags: ["Speed Game", "Dice Rolling", "Word Game"]
    },
    {
      name: "Dog Rush",
      category: "Dexterity",
      players: "2-6",
      duration: "10-15 min",
      image: "Assets/Images/Dog Rush.jpg",
      description: "Spot which dog is tangled up in leashes the fastest in this reflex-testing game.",
      tags: ["Observation", "Speed", "Pattern Recognition"]
    },
    {
      name: "Taco Cat Goat Cheese Pizza",
      category: "Party",
      players: "3-8",
      duration: "10-15 min",
      image: "Assets/Images/Taco Cat Goat Cheese Pizza.jpg",
      description: "Say words and slap cards fast—this chaotic game tests your reflexes and memory.",
      tags: ["Speed Game", "Party", "Reflex"]
    },
    {
      name: "Mimiq",
      category: "Party",
      players: "2-6",
      duration: "10-15 min",
      image: "Assets/Images/Mimiq.jpg",
      description: "Collect matching sets by mimicking facial expressions and reading others.",
      tags: ["Memory", "Facial Expression", "Kids"]
    },
    {
      name: "Sekata",
      category: "Word Game",
      players: "2-6",
      duration: "20-30 min",
      image: "Assets/Images/Sekata.png",
      description: "Guess the same word as your teammate with only a single clue!",
      tags: ["Team-Based", "Word Guessing", "Communication"]
    },
    {
      name: "Who Did It?",
      category: "Party",
      players: "3-6",
      duration: "15 min",
      image: "Assets/Images/Who Did It.jpg",
      description: "Accuse your friends’ pets of making a mess before they accuse yours!",
      tags: ["Bluffing", "Memory", "Reaction"]
    },
    {
      name: "Shadows Amsterdam",
      category: "Deduction",
      players: "2-8",
      duration: "20 min",
      image: "Assets/Images/Shadows Amsterdam.avif",
      description: "Give clues using pictures in this fast-paced real-time deduction game.",
      tags: ["Deduction", "Real-Time", "Wordless Clues"]
    },
    {
      name: "Trial by Trolley",
      category: "Bluffing",
      players: "3-13",
      duration: "30 min",
      image: "Assets/Images/Trial by Trolley.jpg",
      description: "A darkly humorous game of moral dilemmas and choosing who lives or dies.",
      tags: ["Debate", "Bluffing", "Dark Humor"]
    },
    {
      name: "Dobble",
      category: "Party",
      players: "2-8",
      duration: "15 min",
      image: "Assets/Images/Dobble.jpg",
      description: "Find matching symbols faster than your opponents in this speedy observation game.",
      tags: ["Observation", "Speed", "Reflex"]
    },
    {
      name: "Yogi",
      category: "Party",
      players: "3-10",
      duration: "15-20 min",
      image: "Assets/Images/Yogi.jpg",
      description: "Twist, stretch, and hold awkward poses in this hilarious physical challenge game.",
      tags: ["Dexterity", "Physical", "Silly Fun"]
    },
    {
      name: "Mascarade",
      category: "Bluffing",
      players: "2-13",
      duration: "30 min",
      image: "Assets/Images/Mascarade.jpg",
      description: "A game of hidden roles, fast swaps, and clever bluffing at a grand masquerade ball.",
      tags: ["Hidden Roles", "Memory", "Bluffing"]
    },
    {
      name: "Scape Goat",
      category: "Bluffing",
      players: "3-6",
      duration: "20-30 min",
      image: "Assets/Images/Scape Goat.webp",
      description: "One player is the scapegoat—can they figure it out before they’re thrown under the bus?",
      tags: ["Deduction", "Hidden Identity", "Bluffing"]
    },
    {
      name: "Avalon",
      category: "Bluffing",
      players: "5-10",
      duration: "30 min",
      image: "Assets/Images/Avalon.jpg",
      description: "A hidden role game of good vs evil set in Arthurian legend.",
      tags: ["Social Deduction", "Bluffing", "Team-Based"]
    },
    {
      name: "Two Rooms and a Boom",
      category: "Party",
      players: "6-30",
      duration: "15-20 min",
      image: "Assets/Images/Two Rooms and a Boom.webp",
      description: "Split into two rooms and use hidden roles to protect or assassinate the president.",
      tags: ["Hidden Roles", "Social Deduction", "Party"]
    },
    {
      name: "Here to Slay",
      category: "Strategy",
      players: "2-6",
      duration: "30-60 min",
      image: "Assets/Images/Here to Slay.jpg",
      description: "Assemble a party of heroes and slay monsters or sabotage your rivals in this fantasy card game.",
      tags: ["Set Collection", "Card Game", "Take That"]
    },
    {
      name: "Werewolf Deluxe",
      category: "Party",
      players: "8-35",
      duration: "30-45 min",
      image: "Assets/Images/Werewolf Deluxe.webp",
      description: "A social deduction classic where players must discover the werewolves hiding in the village.",
      tags: ["Social Deduction", "Hidden Roles", "Bluffing"]
    },
    {
      name: "One Night Ultimate Werewolf",
      category: "Social Deduction",
      players: "3-10",
      duration: "10 min",
      image: "Assets/Images/One Night Ultimate Werewolf.jpg",
      description: "Figure out who among you is the werewolf — in just one chaotic night!",
      tags: ["Hidden Roles", "Bluffing", "Party Game"]
    },
    {
      name: "Hamster Clan",
      category: "Family",
      players: "1-4",
      duration: "15-20 min",
      image: "Assets/Images/Hamster Clan.jpg",
      description: "Help the hamster family gather food for winter by moving through tunnels and collecting goods.",
      tags: ["Kids", "Movement", "Cooperative"]
    },
    {
      name: "Animal Upon Animal",
      category: "Dexterity",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Animal Upon Animal.jpg",
      description: "Stack wooden animals in this wobbly, fun dexterity game for all ages.",
      tags: ["Stacking", "Dexterity", "Kids"]
    },
    {
      name: "Texas Hold'em Set",
      category: "Card Game",
      players: "2-10",
      duration: "30-90 min",
      image: "Assets/Images/Texas Holdem.jpg",
      description: "Classic poker experience with bluffing, betting, and bold moves.",
      tags: ["Betting", "Bluffing", "Card Game"]
    },
    {
      name: "Bendomino",
      category: "Family",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Bendomino.webp",
      description: "A curved twist on the classic domino game requiring smart placement and planning.",
      tags: ["Tile Placement", "Domino", "Abstract"]
    },
    {
      name: "One Key",
      category: "Cooperative",
      players: "2-6",
      duration: "20 min",
      image: "Assets/Images/One Key.jpg",
      description: "Find the key image through abstract clues before time runs out.",
      tags: ["Deduction", "Team-Based", "Clue Giving"]
    },
    {
      name: "Stella",
      category: "Party",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/Stella.webp",
      description: "Connect images through associations in the Dixit universe.",
      tags: ["Word Association", "Creativity", "Deduction"]
    },
    {
      name: "Catch the Moon",
      category: "Dexterity",
      players: "2-6",
      duration: "20 min",
      image: "Assets/Images/Catch the Moon.png",
      description: "Climb to the moon by balancing ladders—don't let your dreams crash!",
      tags: ["Dexterity", "Balancing", "Tension"]
    },
    {
      name: "Canvas",
      category: "Strategy",
      players: "1-5",
      duration: "30 min",
      image: "Assets/Images/Canvas.webp",
      description: "Create beautiful paintings by layering transparent cards for points and aesthetics.",
      tags: ["Set Collection", "Art", "Drafting"]
    },
    {
      name: "So Clover!",
      category: "Word Game",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/So Clover.webp",
      description: "Write clues that connect word pairs and work as a team to solve the clover puzzle.",
      tags: ["Cooperative", "Word Game", "Clue Giving"]
    },
    {
      name: "Slide Quest",
      category: "Dexterity",
      players: "1-4",
      duration: "20-30 min",
      image: "Assets/Images/Slide Quest.jpg",
      description: "Guide a knight through traps and puzzles by tilting the board together.",
      tags: ["Cooperative", "Dexterity", "Adventure"]
    },
    {
      name: "Goblet Gobblers",
      category: "Abstract",
      players: "2",
      duration: "5-10 min",
      image: "Assets/Images/Goblet Gobblers.jpg",
      description: "A fun twist on Tic Tac Toe where bigger pieces can gobble up smaller ones!",
      tags: ["Abstract Strategy", "Tic Tac Toe", "Blocking"]
    },
    {
      name: "Gummi Land",
      category: "Family",
      players: "2-4",
      duration: "15-30 min",
      image: "Assets/Images/Gummi Land.jpg",
      description: "Collect colorful gummies and complete orders in this sweet strategy game.",
      tags: ["Set Collection", "Kids", "Pattern Matching"]
    },
    {
      name: "Mr Wolf",
      category: "Cooperative",
      players: "1-4",
      duration: "15-20 min",
      image: "Assets/Images/Mr Wolf.jpg",
      description: "Work together to hide animals in their barns before the wolf arrives!",
      tags: ["Memory", "Cooperative", "Kids"]
    },
    {
      name: "Happy Bunny",
      category: "Cooperative",
      players: "1-4",
      duration: "15 min",
      image: "Assets/Images/Happy Bunny.jpg",
      description: "Help the bunny pick only ripe carrots for the farmer's basket.",
      tags: ["Memory", "Cooperative", "Kids"]
    },
    {
      name: "Harvest Dice",
      category: "Strategy",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Harvest Dice.jpg",
      description: "Draft dice to plant crops and feed your pig in this farm-themed roll and write.",
      tags: ["Dice Rolling", "Roll and Write", "Set Collection"]
    },
    {
      name: "No Thanks",
      category: "Card Game",
      players: "3-7",
      duration: "20 min",
      image: "Assets/Images/No Thanks.jpg",
      description: "A quick, clever game of risk-taking and card avoidance with simple rules and tough decisions.",
      tags: ["Push Your Luck", "Card Game", "Minimalist"]
    },
    {
      name: "Halli Galli",
      category: "Party",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Halli Galli.png",
      description: "A fast-reaction game where players race to ring the bell when fruit sets match!",
      tags: ["Reaction", "Speed", "Pattern Recognition"]
    },
    {
      name: "Geistes Blitz",
      category: "Party",
      players: "2-8",
      duration: "20 min",
      image: "Assets/Images/Geistes Blitz.jpg",
      description: "Grab the right object first using lightning-fast reflexes and visual logic.",
      tags: ["Speed Game", "Reflex", "Observation"]
    },
    {
      name: "Jungle Speed Safari",
      category: "Party",
      players: "2-6",
      duration: "15-20 min",
      image: "Assets/Images/Jungle Speed Safari.jpg",
      description: "A wilder version of Jungle Speed with animal noises and quick reflex challenges.",
      tags: ["Reflex", "Party", "Animal Theme"]
    },
    {
      name: "Cookie Box",
      category: "Dexterity",
      players: "2-4",
      duration: "15 min",
      image: "Assets/Images/Cookie Box.webp",
      description: "Stack, balance, and race to arrange cookies and boxes faster than your friends.",
      tags: ["Stacking", "Speed", "Kids"]
    },
    {
      name: "Bears in Barrels",
      category: "Party",
      players: "2-4",
      duration: "10-15 min",
      image: "Assets/Images/Bears in Barrels.jpg",
      description: "Wind up the bears and race them across the table in this silly action game.",
      tags: ["Dexterity", "Wind-Up Toys", "Racing"]
    },
    {
      name: "Felicity: The Cat in the Sack",
      category: "Bluffing",
      players: "3-5",
      duration: "20-30 min",
      image: "Assets/Images/Felicity.jpg",
      description: "Bid blindly for mystery cats—and avoid dogs—in this quirky auction game.",
      tags: ["Auction", "Bluffing", "Set Collection"]
    },
    {
      name: "Bam Bam Race",
      category: "Dexterity",
      players: "2-4",
      duration: "10-15 min",
      image: "Assets/Images/Bam Bam Race.webp",
      description: "Race your car across the floor in this slam-the-pawn action game!",
      tags: ["Dexterity", "Racing", "Kids"]
    },
    {
      name: "Cat Lady",
      category: "Card Game",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Cat Lady.png",
      description: "Collect cats, food, toys, and costumes to become the ultimate cat lover.",
      tags: ["Set Collection", "Drafting", "Cute Theme"]
    },
    {
      name: "Mantis",
      category: "Card Game",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Mantis.webp",
      description: "A fast, colorful card-stealing game from the makers of Exploding Kittens.",
      tags: ["Stealing", "Set Collection", "Color Matching"]
    },
    {
      name: "Crash Octopus",
      category: "Dexterity",
      players: "2-5",
      duration: "30 min",
      image: "Assets/Images/Crash Octopus.webp",
      description: "Flick and collect treasures while dodging the chaotic movements of a giant octopus!",
      tags: ["Flicking", "Dexterity", "Modular Board"]
    },
    {
      name: "Smile",
      category: "Card Game",
      players: "3-5",
      duration: "30 min",
      image: "Assets/Images/Smile.jpg",
      description: "Capture cute creatures with glowworms—but be careful, some aren’t so friendly.",
      tags: ["Auction", "Set Collection", "Bluffing"]
    },
    {
      name: "Who Is It?",
      category: "Deduction",
      players: "2",
      duration: "15-20 min",
      image: "Assets/Images/Who Is It.jpg",
      description: "A kid-friendly guessing game where players try to find the mystery character.",
      tags: ["Guessing", "Deduction", "Kids"]
    },
    {
      name: "Sheriff of Nottingham 1st Edition",
      category: "Bluffing",
      players: "3-5",
      duration: "45 min",
      image: "Assets/Images/Sheriff of Nottingham 1st.webp",
      description: "Smuggle goods past the Sheriff or inspect players for contraband in this classic bluffing game.",
      tags: ["Bluffing", "Negotiation", "Bribery"]
    },
    {
      name: "Dr. Beaker",
      category: "Family",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Dr Beaker.jpg",
      description: "Race to mix chemicals in your beaker by rotating molecules into place.",
      tags: ["Dexterity", "Pattern Matching", "Puzzle"]
    },
    {
      name: "Pengoloo",
      category: "Kids",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Pengoloo.jpg",
      description: "Roll dice, remember colors, and collect eggs in this adorable memory game.",
      tags: ["Memory", "Dice Rolling", "Animal Theme"]
    },
    {
      name: "Get Packing",
      category: "Puzzle",
      players: "1-4",
      duration: "15-30 min",
      image: "Assets/Images/Get Packing.jpg",
      description: "Fit all the vacation items into your suitcase before your opponents.",
      tags: ["Spatial Reasoning", "Puzzle", "Race"]
    },
    {
      name: "Meeple Circus",
      category: "Dexterity",
      players: "2-5",
      duration: "45 min",
      image: "Assets/Images/Meeple Circus.jpg",
      description: "Stack and balance meeples to create daring circus performances.",
      tags: ["Stacking", "Dexterity", "Timed"]
    },
    {
      name: "Panic Mansion",
      category: "Dexterity",
      players: "2-4",
      duration: "20 min",
      image: "Assets/Images/Panic Mansion.jpg",
      description: "Shake your box to move the right objects into the right rooms the fastest.",
      tags: ["Real-Time", "Dexterity", "Speed"]
    },
    {
      name: "Peek-A-Mouse",
      category: "Kids",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Peek a Mouse.jpg",
      description: "Spot the objects the mice borrowed while they’re still lit up!",
      tags: ["Memory", "Observation", "Flashlight"]
    },
    {
      name: "Tock Tock Woodman",
      category: "Dexterity",
      players: "2-7",
      duration: "10-15 min",
      image: "Assets/Images/Tock Tock Woodman.webp",
      description: "Chop the tree carefully without knocking it all down in this light-hearted game.",
      tags: ["Dexterity", "Stacking", "Tension"]
    },
    {
      name: "Rhino Hero",
      category: "Family",
      players: "2-5",
      duration: "15 min",
      image: "Assets/Images/Rhino Hero.webp",
      description: "Stack walls and roofs while helping Rhino Hero climb up the building.",
      tags: ["Stacking", "Dexterity", "Kids"]
    },
    {
      name: "Nyctophobia",
      category: "Horror",
      players: "3-5",
      duration: "30-45 min",
      image: "Assets/Images/Nyctophobia.jpg",
      description: "Play in near-darkness and try to survive a stalker you can’t see.",
      tags: ["Unique Mechanic", "Survival", "Cooperative"]
    },
    {
      name: "Chronicles of Crime",
      category: "Deduction",
      players: "1-4",
      duration: "60-90 min",
      image: "Assets/Images/Chronicles of Crime.jpg",
      description: "Use VR and QR codes to investigate murder cases and solve mysteries.",
      tags: ["Crime Solving", "Technology", "Story Driven"]
    },
    {
      name: "Unlock: Escape Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Escape Adventures.jpg",
      description: "Escape room in a box! Solve puzzles cooperatively using cards and a free app.",
      tags: ["Escape Room", "Puzzle", "Cooperative"]
    },
    {
      name: "Unlock: Timeless Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Timeless Adventures.webp",
      description: "Solve new escape scenarios spanning past, present, and future.",
      tags: ["Escape Room", "Time Travel", "Puzzle"]
    },
    {
      name: "Unlock: Heroic Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Heroic Adventures.jpg",
      description: "Face off against heroic challenges in this narrative escape game pack.",
      tags: ["Puzzle", "Storytelling", "Adventure"]
    },
    {
      name: "Unlock: Exotic Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Exotic Adventures.jpg",
      description: "Embark on three exotic themed escape room adventures using clever logic and teamwork.",
      tags: ["Escape Room", "Exploration", "Puzzle"]
    },
    {
      name: "Unlock: Mystery Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Mystery Adventures.jpg",
      description: "Delve into mysteries and unravel complex scenarios with creative thinking.",
      tags: ["Puzzle", "Mystery", "Narrative"]
    },
    {
      name: "Ark Nova",
      category: "Strategy",
      players: "1-4",
      duration: "90-150 min",
      image: "Assets/Images/Ark Nova.jpg",
      description: "Design a modern zoo and support conservation projects in this deep strategy game.",
      tags: ["Engine Building", "Tile Placement", "Card Drafting"]
    },
    {
      name: "Celestia",
      category: "Family",
      players: "2-6",
      duration: "30 min",
      image: "Assets/Images/Celestia.avif",
      description: "Push your luck as you explore floating cities in a flying ship—stay onboard or bail out early?",
      tags: ["Push Your Luck", "Bluffing", "Adventure"]
    },
    {
      name: "Cascadia",
      category: "Abstract",
      players: "1-4",
      duration: "30-45 min",
      image: "Assets/Images/Cascadia.jpg",
      description: "Build beautiful natural habitats in the Pacific Northwest with clever tile and token placement.",
      tags: ["Tile Placement", "Pattern Building", "Nature"]
    },
    {
      name: "Point Salad",
      category: "Card Game",
      players: "2-6",
      duration: "15-30 min",
      image: "Assets/Images/Point Salad.png",
      description: "Draft veggies and scoring conditions to make the tastiest (and most strategic) salad.",
      tags: ["Card Drafting", "Set Collection", "Quick Play"]
    },
    {
      name: "Bohnanza",
      category: "Card Game",
      players: "2-7",
      duration: "45 min",
      image: "Assets/Images/Bohnanza.jpg",
      description: "Plant, trade, and harvest beans—but you can't rearrange your hand!",
      tags: ["Trading", "Hand Management", "Set Collection"]
    },
    {
      name: "Tokyo Highway",
      category: "Dexterity",
      players: "2-4",
      duration: "30-50 min",
      image: "Assets/Images/Tokyo Highway.jpg",
      description: "Stack roads and pillars to build your highway in this delicate and artistic dexterity game.",
      tags: ["Dexterity", "Construction", "Precision"]
    },
    {
      name: "Awkward Guests",
      category: "Deduction",
      players: "1-8",
      duration: "45-75 min",
      image: "Assets/Images/Awkward Guests.webp",
      description: "Solve a mysterious murder using variable clues in this replayable deduction game.",
      tags: ["Deduction", "Mystery", "Card Game"]
    },
    {
      name: "Citadels",
      category: "Strategy",
      players: "2-8",
      duration: "30-60 min",
      image: "Assets/Images/Citadels.jpg",
      description: "Use character roles to build a medieval city while bluffing and outwitting opponents.",
      tags: ["Bluffing", "Role Selection", "City Building"]
    },
    {
      name: "Cockroach Poker",
      category: "Bluffing",
      players: "2-6",
      duration: "20 min",
      image: "Assets/Images/Cockroach Poker.png",
      description: "Lie about disgusting creatures and call your friends' bluffs in this cheeky bluffing game.",
      tags: ["Bluffing", "Party", "Lying"]
    },
    {
      name: "Decrypto",
      category: "Word Game",
      players: "3-8",
      duration: "30 min",
      image: "Assets/Images/Decrypto.jpg",
      description: "Communicate secret codes to your team while intercepting your opponents’ clues.",
      tags: ["Word Game", "Deduction", "Team-Based"]
    },
    {
      name: "Cubitos",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Cubitos.webp",
      description: "Roll, push your luck, and race across a wild track in this cube-chucking race game.",
      tags: ["Dice Rolling", "Racing", "Push Your Luck"]
    },
    {
      name: "Saboteur",
      category: "Bluffing",
      players: "3-10",
      duration: "30 min",
      image: "Assets/Images/Saboteur.jpg",
      description: "Work together to mine gold—or secretly sabotage your team in this hidden role game.",
      tags: ["Hidden Roles", "Bluffing", "Team-Based"]
    },
    {
      name: "Chinatown",
      category: "Negotiation",
      players: "3-5",
      duration: "60 min",
      image: "Assets/Images/Chinatown.jpg",
      description: "Buy lots, trade deals, and build shops in this pure negotiation classic set in 1960s NYC.",
      tags: ["Negotiation", "Economic", "Tile Placement"]
    },
    {
      name: "Cubeez",
      category: "Dexterity",
      players: "2-4",
      duration: "10-15 min",
      image: "Assets/Images/Cubeez.jpg",
      description: "Race to arrange cubes and match faces in this quick, silly puzzle game.",
      tags: ["Pattern Recognition", "Speed", "Puzzle"]
    },
    {
      name: "Earth",
      category: "Strategy",
      players: "1-5",
      duration: "45-90 min",
      image: "Assets/Images/Earth.jpg",
      description: "Grow an ecosystem using cards and combos in this nature-themed tableau builder.",
      tags: ["Engine Building", "Card Game", "Nature"]
    },
    {
      name: "Dice Forge",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Dice Forge.jpg",
      description: "Craft your own dice and compete in divine trials to gain glory!",
      tags: ["Dice Crafting", "Resource Management", "Mythology"]
    },
    {
      name: "Colt Express",
      category: "Family",
      players: "2-6",
      duration: "40 min",
      image: "Assets/Images/Colt Express.png",
      description: "Program your bandit’s actions and loot a 3D train in this chaotic western adventure.",
      tags: ["Action Programming", "Thematic", "Wild West"]
    },
    {
      name: "God of War: The Card Game",
      category: "Cooperative",
      players: "1-4",
      duration: "60-90 min",
      image: "Assets/Images/God of War.jpeg",
      description: "Team up to defeat monsters and change your fate in this Norse mythology card game.",
      tags: ["Cooperative", "Card Drafting", "Scenario-Based"]
    },
    {
      name: "Jamaica",
      category: "Family",
      players: "2-6",
      duration: "30-60 min",
      image: "Assets/Images/Jamaica.webp",
      description: "Race around the island, plunder treasures, and fight pirates in this colorful adventure game.",
      tags: ["Racing", "Resource Management", "Pirates"]
    },
    {
      name: "Memoir '44",
      category: "Strategy",
      players: "2",
      duration: "30-60 min",
      image: "Assets/Images/Memoir 44.jpg",
      description: "Relive World War II battles in this historical scenario-based war game.",
      tags: ["Wargame", "Scenario-Based", "Tactical"]
    },
    {
      name: "Planet",
      category: "Abstract",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Planet.jpg",
      description: "Build a 3D planet by placing magnetic terrain tiles to create habitats for animals.",
      tags: ["Tile Placement", "3D", "Nature"]
    },
    {
      name: "Insider",
      category: "Party",
      players: "4-8",
      duration: "15-20 min",
      image: "Assets/Images/Insider.jpg",
      description: "One player knows the secret word… and must help others guess it without being caught.",
      tags: ["Hidden Roles", "Deduction", "Word Game"]
    },
    {
      name: "Letter from Whitechapel",
      category: "Deduction",
      players: "2-6",
      duration: "90 min",
      image: "Assets/Images/Letter from Whitechapel.webp",
      description: "Track down Jack the Ripper—or play as Jack and try to escape detection.",
      tags: ["Hidden Movement", "Deduction", "Historical"]
    },
    {
      name: "Scout",
      category: "Card Game",
      players: "2-5",
      duration: "20 min",
      image: "Assets/Images/Scout.jpg",
      description: "Climb the ladder with clever card combos in this fast-paced, award-winning card game.",
      tags: ["Ladder Climbing", "Hand Management", "Tactical"]
    },
    {
      name: "Speed Cups",
      category: "Dexterity",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Speed Cups.jpg",
      description: "Stack and arrange colorful cups quickly to match patterns on challenge cards.",
      tags: ["Speed", "Pattern Matching", "Reflex"]
    },
    {
      name: "Sticky Chameleons",
      category: "Party",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Sticky Chameleons.jpg",
      description: "Use sticky tongues to grab insects in this hilarious, fast-paced reaction game.",
      tags: ["Dexterity", "Speed", "Kids"]
    },
    {
      name: "Survive: Escape from Atlantis!",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Survive from Atlantis.jpg",
      description: "Escape the sinking island while avoiding sea monsters and sabotaging your friends.",
      tags: ["Survival", "Tile Removal", "Take That"]
    },
    {
      name: "Sushi Go Party!",
      category: "Card Game",
      players: "2-8",
      duration: "20 min",
      image: "Assets/Images/Sushi Go Party.jpg",
      description: "Draft your favorite sushi dishes and create point-winning combos in this delicious party edition.",
      tags: ["Card Drafting", "Set Collection", "Family"]
    },
    {
      name: "Tussie Mussie",
      category: "Card Game",
      players: "1-4",
      duration: "20 min",
      image: "Assets/Images/Tussie Mussie.webp",
      description: "Offer flowers with hidden meanings in this elegant game of bluffing and set collection.",
      tags: ["Bluffing", "Set Collection", "Pocket Game"]
    },
    {
      name: "Unstable Unicorns",
      category: "Party",
      players: "2-8",
      duration: "30-45 min",
      image: "Assets/Images/Unstable Unicorns.webp",
      description: "Build your unicorn army and betray your friends in this chaotic and adorable card game.",
      tags: ["Take That", "Set Collection", "Humor"]
    },
    {
      name: "Braintopia",
      category: "Puzzle",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Braintopia.jpg",
      description: "Test your brain across 8 types of challenges—from memory to coordination.",
      tags: ["Brain Teaser", "Speed", "Variety"]
    },
    {
      name: "Deception: Murder in Hong Kong",
      category: "Deduction",
      players: "4-12",
      duration: "20-30 min",
      image: "Assets/Images/Deception.jpg",
      description: "Solve a murder case—but the killer is among you in this hidden role deduction game.",
      tags: ["Hidden Roles", "Deduction", "Social"]
    },
    {
      name: "Fog of Love",
      category: "Thematic",
      players: "2",
      duration: "60-120 min",
      image: "Assets/Images/Fog of Love.webp",
      description: "Roleplay a romantic comedy where each player’s choices shape a unique love story.",
      tags: ["Storytelling", "Roleplaying", "Negotiation"]
    },
    {
      name: "Dice Throne: Marvel",
      category: "Strategy",
      players: "2-6",
      duration: "30-45 min",
      image: "Assets/Images/Dice Throne Marvel.webp",
      description: "Battle using Marvel heroes in this Yahtzee-style combat game with asymmetric powers.",
      tags: ["Dice Rolling", "Combat", "Marvel"]
    },
    {
      name: "Dice Throne: Santa vs Krampus",
      category: "Duel",
      players: "2",
      duration: "20-40 min",
      image: "Assets/Images/Dice Throne Santa vs Krampus.jpg",
      description: "Battle it out with holiday flair in this stand-alone Dice Throne showdown.",
      tags: ["Dice Rolling", "Combat", "Holiday-Themed"]
    },
    {
      name: "Sherlock Holmes: Consulting Detective",
      category: "Deduction",
      players: "1-8",
      duration: "60-120 min",
      image: "Assets/Images/Sherlock Holmes Consulting Detective.jpg",
      description: "Solve cases by interviewing suspects, finding clues, and reading through immersive mysteries.",
      tags: ["Deduction", "Cooperative", "Story-Driven"]
    },
    {
      name: "Mysterium",
      category: "Cooperative",
      players: "2-7",
      duration: "45 min",
      image: "Assets/Images/Mysterium.jpg",
      description: "Communicate with a ghost using visions to solve a murder mystery in a haunted mansion.",
      tags: ["Cooperative", "Deduction", "Visual Clues"]
    },
    {
      name: "Rhino Hero Super Battle",
      category: "Dexterity",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Rhino Hero Super Battle.jpg",
      description: "Build skyscrapers and battle with superheroes in this wobbly stacking challenge.",
      tags: ["Dexterity", "Stacking", "Kids"]
    },
    {
      name: "Blood Rage",
      category: "Strategy",
      players: "2-4",
      duration: "60-90 min",
      image: "Assets/Images/Blood Rage.jpg",
      description: "Control Viking clans, gain glory through battle, and face Ragnarok in epic Norse warfare.",
      tags: ["Area Control", "Card Drafting", "Mythology"]
    },
    {
      name: "Mr. Jack",
      category: "Deduction",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/Mr Jack.png",
      description: "Play as Jack the Ripper or the detective trying to catch him in this tense two-player duel.",
      tags: ["Hidden Movement", "Bluffing", "Asymmetric"]
    },
    {
      name: "Bureau of Investigations",
      category: "Deduction",
      players: "1-5",
      duration: "90-120 min",
      image: "Assets/Images/Bureau of Investigations.webp",
      description: "Solve Lovecraftian mysteries in the 1920s as investigators uncover strange happenings.",
      tags: ["Deduction", "Storytelling", "Cthulhu Mythos"]
    },
    {
      name: "Dead Last",
      category: "Party",
      players: "6-12",
      duration: "30 min",
      image: "Assets/Images/Dead Last.jpeg",
      description: "Conspire, betray, and outlast everyone else in this social collusion game.",
      tags: ["Social Deduction", "Voting", "Bluffing"]
    },
    {
      name: "In Vino Morte",
      category: "Bluffing",
      players: "3-12",
      duration: "10 min",
      image: "Assets/Images/In Vino Morte.png",
      description: "Choose wine or poison... and try not to die in this micro bluffing game.",
      tags: ["Bluffing", "Microgame", "Social"]
    },
    {
      name: "Exploding Kittens Recipes For Disaster",
      category: "Party",
      players: "2-5",
      duration: "15 min",
      image: "Assets/Images/Exploding Kittens Blue.webp",
      description: "More chaos and card combos in this hilarious expansion to the feline-fueled base game.",
      tags: ["Expansion", "Humor", "Push Your Luck"]
    },
    {
      name: "Katamino Family",
      category: "Puzzle",
      players: "1-2",
      duration: "10-20 min",
      image: "Assets/Images/Katamino Family.webp",
      description: "A clever spatial challenge for all ages—fit the pieces perfectly in increasingly difficult puzzles.",
      tags: ["Tetris-Like", "Spatial", "Kids Friendly"]
    },
    {
      name: "Not Alone",
      category: "Bluffing",
      players: "2-7",
      duration: "30-45 min",
      image: "Assets/Images/Not Alone.png",
      description: "One player hunts the others on an alien planet in this asymmetrical survival game.",
      tags: ["Asymmetric", "Bluffing", "Sci-Fi"]
    },
    {
      name: "Obrolan Hati Pacar",
      category: "Party",
      players: "2+",
      duration: "30+ min",
      image: "Assets/Images/Obrolan Hati.png",
      description: "A local card game for deep, meaningful, or spicy relationship conversations.",
      tags: ["Conversation", "Local", "Relationship"]
    },
    {
      name: "Memoarr!",
      category: "Memory",
      players: "2-4",
      duration: "20 min",
      image: "Assets/Images/Memoarr.jpg",
      description: "Escape from a sinking island by remembering matching images and avoiding traps.",
      tags: ["Memory", "Animal Theme", "Kids Friendly"]
    },
    {
      name: "House of Danger",
      category: "Adventure",
      players: "1-8",
      duration: "60-90 min",
      image: "Assets/Images/House of Danger.jpg",
      description: "Explore a haunted mansion in this choose-your-own-adventure mystery game.",
      tags: ["Storytelling", "Exploration", "Solo-Friendly"]
    },
    {
      name: "Agricola",
      category: "Strategy",
      players: "1-5",
      duration: "30-150 min",
      image: "Assets/Images/Agricola.webp",
      description: "Build and manage your farm through careful planning and resource allocation.",
      tags: ["Worker Placement", "Resource Management", "Farming"]
    },
    {
      name: "Stupefy",
      category: "Party",
      players: "3-8",
      duration: "30 min",
      image: "Assets/Images/Stupefy.webp",
      description: "Cast spells and outwit your opponents in this fast-paced wizard duel.",
      tags: ["Bluffing", "Party Game", "Magic-Themed"]
    },
    {
      name: "Cupcake Academy",
      category: "Family",
      players: "2-4",
      duration: "10-20 min",
      image: "Assets/Images/Cupcake Academy.webp",
      description: "Work together in real-time to organize colorful cupcake trays and complete challenges.",
      tags: ["Real-Time", "Cooperative", "Pattern Recognition"]
    },    
    {
      name: "Santai Aja Lagi",
      category: "Casual",
      players: "2-6",
      duration: "30 min",
      image: "Assets/Images/Santai Aja Lagi.jpeg",
      description: "A chill game about taking it easy, making choices, and vibing with friends.",
      tags: ["Relaxing", "Conversation", "Light Strategy"]
    },
    {
      name: "Sequence",
      category: "Family",
      players: "2-12",
      duration: "30 min",
      image: "Assets/Images/Sequence.avif",
      description: "Play cards and place chips to get five in a row before your opponents do.",
      tags: ["Card Game", "Pattern Building", "Strategy"]
    },
    {
      name: "Go Go Gelato!",
      category: "Kids",
      players: "2-4",
      duration: "15 min",
      image: "Assets/Images/Go Go Gelato.png",
      description: "Race to match ice cream cone challenges using coordination and speed.",
      tags: ["Dexterity", "Pattern Matching", "Real-Time"]
    },
    {
      name: "Duck Duck Go",
      category: "Family",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Duck Duck Go.png",
      description: "Race rubber duckies through a bathtub obstacle course with strategic moves.",
      tags: ["Programming", "Racing", "Family Friendly"]
    },
    {
      name: "Herd Mentality",
      category: "Party",
      players: "4-20",
      duration: "20 min",
      image: "Assets/Images/Herd Mentality.jpg",
      description: "Write the same answer as the herd to win — but avoid being the odd one out!",
      tags: ["Party Game", "Social", "Humor"]
    },
    {
      name: "Battle Sheep",
      category: "Abstract",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Battle Sheep.jpg",
      description: "Spread your sheep across the pasture while blocking your opponents.",
      tags: ["Area Control", "Tile Placement", "Abstract"]
    },
    {
      name: "Little Red Riding Hood",
      category: "Storytelling",
      players: "1-4",
      duration: "20-30 min",
      image: "Assets/Images/Little Red Riding Hood.jpg",
      description: "Guide Little Red through the forest in this cooperative fairy tale adventure.",
      tags: ["Cooperative", "Story-Driven", "Family"]
    },
    {
      name: "Snow Time",
      category: "Strategy",
      players: "3-5",
      duration: "30-40 min",
      image: "Assets/Images/Snow Time.jpg",
      description: "Collect magical fruits during a festive snowfall while outwitting opponents.",
      tags: ["Simultaneous Play", "Bluffing", "Area Control"]
    },
    {
      name: "Geometric Art",
      category: "Party",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/Geometric Art.webp",
      description: "Draw geometric patterns to communicate clues in this artistic deduction game.",
      tags: ["Drawing", "Deduction", "Creativity"]
    },
    {
      name: "Tortuga",
      category: "Social Deduction",
      players: "2-9",
      duration: "20-40 min",
      image: "Assets/Images/Tortuga.webp",
      description: "Swear loyalty to a side and fight for treasure aboard the pirate ship Tortuga.",
      tags: ["Hidden Roles", "Voting", "Thematic"]
    },
    {
      name: "The Grizzled",
      category: "Cooperative",
      players: "2-5",
      duration: "30 min",
      image: "Assets/Images/The Grizzled.jpg",
      description: "Survive the emotional toll of WWI in this poignant and challenging card game.",
      tags: ["Cooperative", "Hand Management", "War-Themed"]
    },
    {
      name: "Machi Koro",
      category: "City Building",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Machi Koro.webp",
      description: "Roll dice, earn income, and develop your city faster than your rivals.",
      tags: ["Dice Rolling", "Engine Building", "Light Strategy"]
    },
    {
      name: "Chromino",
      category: "Abstract",
      players: "1-6",
      duration: "30 min",
      image: "Assets/Images/Chromino.jpg",
      description: "Match colorful tiles in this domino-style strategy game with a twist.",
      tags: ["Tile Placement", "Color Matching", "Abstract"]
    },
    {
      name: "Spirit Island",
      category: "Cooperative",
      players: "1-4",
      duration: "90-120 min",
      image: "Assets/Images/Spirit Island.webp",
      description: "Become powerful spirits defending your island from invading colonizers.",
      tags: ["Cooperative", "Area Control", "Asymmetric Powers"]
    },
    {
      name: "IKI",
      category: "Strategy",
      players: "2-4",
      duration: "60-90 min",
      image: "Assets/Images/Iki.webp",
      description: "Live the life of an Edo-period merchant and become the most respected citizen.",
      tags: ["Resource Management", "Worker Placement", "Historical"]
    },
    {
      name: "Happy Little Dinosaurs",
      category: "Party",
      players: "2-4",
      duration: "30-60 min",
      image: "Assets/Images/Happy Little Dinosaurs.jpg",
      description: "Dodge disasters and be the last dino standing in this hilarious survival game.",
      tags: ["Humor", "Take That", "Light Strategy"]
    },
    {
      name: "Mansions of Madness",
      category: "Horror",
      players: "1-5",
      duration: "120-180 min",
      image: "Assets/Images/Mansions of Madness.jpg",
      description: "Explore haunted mansions, solve mysteries, and battle Lovecraftian horrors.",
      tags: ["Cooperative", "App-Driven", "Exploration", "Horror"]
    },
    {
      name: "Cards Against Humanity",
      category: "Party",
      players: "4-20+",
      duration: "30-90 min",
      image: "Assets/Images/Cards Against Humanity.jpeg",
      description: "A game for horrible people. Match cards for the funniest (or darkest) combos.",
      tags: ["Humor", "Adult", "Fill-in-the-Blank"]
    },
    {
      name: "Cash 'n Guns",
      category: "Party",
      players: "4-8",
      duration: "30 min",
      image: "Assets/Images/Cash n Guns.webp",
      description: "Point foam guns at your friends to split the loot — or go down in a standoff.",
      tags: ["Bluffing", "Party Game", "Action Selection"]
    },
    {
      name: "Aquatica",
      category: "Strategy",
      players: "1-4",
      duration: "30-60 min",
      image: "Assets/Images/Aquatica.png",
      description: "Dive into an underwater kingdom and rise to power through tactical depth.",
      tags: ["Engine Building", "Hand Management", "Underwater Theme"]
    },
    {
      name: "Telestrations",
      category: "Party",
      players: "4-8",
      duration: "30 min",
      image: "Assets/Images/Telestrations.webp",
      description: "Draw, guess, and laugh your way through a telephone-style drawing game.",
      tags: ["Drawing", "Party Game", "Laugh-Out-Loud"]
    },
    {
      name: "Unconscious Mind",
      category: "Strategy",
      players: "1-4",
      duration: "90-120 min",
      image: "Assets/Images/Unconscious Mind.jpg",
      description: "Explore dreamscapes and psychology in this deep Euro game set in Freud's era.",
      tags: ["Worker Placement", "Tableau Building", "Narrative"]
    },
    {
      name: "YAK",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/YAK.webp",
      description: "Build stone towers and trade with yak caravans in this serene yet tactical game by Michael Luu.",
      tags: ["Resource Management", "Tile Placement", "Visual Strategy"]
    },
    {
      name: "Mahjong",
      category: "Classic",
      players: "4",
      duration: "60-120 min",
      image: "Assets/Images/Mahjong.jpg",
      description: "A traditional Chinese tile game of matching patterns, strategy, and memory.",
      tags: ["Tile Game", "Pattern Recognition", "Classic"]
    },      
  ];

  // 1. Render all boardgames
  function renderBoardgames(filteredGames) {
    container.innerHTML = "";

    if (filteredGames.length === 0) {
      container.innerHTML = "<p>No boardgames found.</p>";
      return;
    }

    filteredGames.forEach(game => {
      const card = document.createElement("div");
      card.className = "boardgame-card fadeUp";
      card.innerHTML = `
        <img src="${game.image}" alt="${game.name}">
        <div class="info">
          <h3>${game.name}</h3>
          <p>${game.description}</p>
          <p><strong>Players:</strong> ${game.players}</p>
          <p><strong>Duration:</strong> ${game.duration}</p>
          <div class="tags">
            ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // 2. Search and filter logic
  function applyFilters() {
    const keyword = searchInput?.value.toLowerCase() || "";
    const selectedCategory = categoryFilter?.value || "All";

    const filtered = boardgames.filter(game => {
      const matchKeyword =
        game.name.toLowerCase().includes(keyword) ||
        game.tags.some(tag => tag.toLowerCase().includes(keyword));
      const matchCategory =
        selectedCategory === "All" || game.category === selectedCategory;

      return matchKeyword && matchCategory;
    });

    renderBoardgames(filtered);
  }

  // 3. Initial load
  renderBoardgames(boardgames);

  // 4. Event listeners
  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  
  // ================= Boardgame Page =================
  if (window.location.pathname === "/" || window.location.pathname.includes("index.html")) {
      const maxToShow = 10;
      const shuffled = boardgames.sort(() => 0.5 - Math.random());
      const toDisplay = shuffled.slice(0, maxToShow);
      renderBoardgames(toDisplay);
      
      if (seeMoreBox) {
        fetch("Assets/PHP/check_session.php")
        .then(res => {
          if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            console.log("check_session response in Boardgame.js:", data);
            seeMoreBox.classList.remove("hidden");
            seeMoreBox.innerHTML = data.loggedIn
            ? `<a href="Collection.html" class="see-more-button">See Other Boardgames</a>`
            : `<p style="margin-top: 20px;">Please <a href="Login.html" style="color: #2563eb; font-weight: bold;">Login</a> or <a href="Signup.html" style="color: #2563eb; font-weight: bold;">Sign Up</a> to see the full collection.</p>`;
          })
          .catch(err => {
            console.error("Error checking session in Boardgame.js:", err);
            seeMoreBox.classList.remove("hidden");
            seeMoreBox.innerHTML = `<p style="margin-top: 20px;">Please <a href="Login.html" style="color: #2563eb; font-weight: bold;">Login</a> or <a href="Signup.html" style="color: #2563eb; font-weight: bold;">Sign Up</a> to see the full collection.</p>`;
          });
        }
      }
      
      // ================= Collection Page =================
      if (window.location.pathname.includes("Collection.html")) {
        fetch("Assets/PHP/check_session.php")
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (!data.loggedIn) {
            alert("You must be logged in to view the full boardgame collection.");
            window.location.href = "Login.html";
            return;
          }
          
          boardgames.sort((a, b) => a.name.localeCompare(b.name)); // Sort A-Z
          
          function groupBoardgamesByLetter(games) {
            const grouped = {};
            games.forEach(game => {
              let letter = game.name && game.name[0] ? game.name[0].toUpperCase() : '#';
              if (!isNaN(letter)) {
                letter = '#';
              }
              
              if (!grouped[letter]) grouped[letter] = [];
              grouped[letter].push(game);
            });
            return grouped;
          }
          
          function renderGroupedBoardgames(games) {
            container.innerHTML = "";
            if (games.length === 0) {
              container.innerHTML = `<p style="text-align:center;">No boardgames found.</p>`;
              return;
            }
            const grouped = groupBoardgamesByLetter(games);
            
            Object.keys(grouped).sort().forEach(letter => {
              const section = document.createElement("section");
              section.id = `letter-${letter}`;
              
              const heading = document.createElement("h2");
              heading.className = "letter-heading";
              heading.textContent = letter;
              section.appendChild(heading);
              
              const groupContainer = document.createElement("div");
              groupContainer.className = "boardgame-container";
              
              grouped[letter].forEach(game => {
                const card = document.createElement("div");
                card.className = "boardgame-card";
                const tagsHtml = game.tags.map(tag => `<span class='tag'>${tag}</span>`).join(" ");
                
                card.innerHTML = `
                <img src="${game.image}" alt="${game.name}" />
                <div class="info">
                <h3>${game.name}</h3>
                <p>Category: ${game.category}</p>
                <div class="tags">${tagsHtml}</div>
                </div>
                <div class="details">
                <p><strong>Players:</strong> ${game.players}</p>
                <p><strong>Duration:</strong> ${game.duration}</p>
                <p>${game.description}</p>
                </div>
                `;
                groupContainer.appendChild(card);
              });
              
              section.appendChild(groupContainer);
              container.appendChild(section);
            });
          }
          
          // Initial render
          renderGroupedBoardgames(boardgames);
          
          function filterBoardgames() {
            const keyword = searchInput.value.toLowerCase();
            const category = categoryFilter.value;
            
            const filtered = boardgames.filter(game => {
              const matchName = game.name.toLowerCase().includes(keyword);
              const matchCategory = category === "" || game.category === category;
              return matchName && matchCategory;
            });
            
            renderGroupedBoardgames(filtered);
          }
          
          if (searchInput && categoryFilter) {
            searchInput.addEventListener("input", filterBoardgames);
            categoryFilter.addEventListener("change", filterBoardgames);
          }
        })
        .catch(err => {
          console.error("Error checking session in Collection.html:", err);
          alert("Error checking session. Please login again.");
          window.location.href = "Login.html";
        });
      }
  });