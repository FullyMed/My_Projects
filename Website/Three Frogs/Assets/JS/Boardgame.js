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
      description: "Trade resources with the other players and build roads and towns until someone reaches 10 points.",
      tags: ["Resource Management", "Trading", "Dice Rolling"]
    },
    {
      name: "Monopoly",
      category: "Family",
      players: "2-6",
      duration: "120 min",
      image: "Assets/Images/Monopoly.avif",
      description: "Buy up streets and charge rent until everyone else goes bankrupt.",
      tags: ["Roll and Move", "Economic", "Player Elimination"]
    },
    {
      name: "Carcassonne",
      category: "Family",
      players: "2-5",
      duration: "45 min",
      image: "Assets/Images/Carcassonne.jpg",
      description: "Lay tiles to build a medieval landscape, then place your followers to claim its cities and roads.",
      tags: ["Tile Placement", "Area Control"]
    },
    {
      name: "Codenames",
      category: "Word Game",
      players: "4-8",
      duration: "15 min",
      image: "Assets/Images/Codenames.jpg",
      description: "Two teams race to find their agents on a grid of words, guided by one-word clues.",
      tags: ["Team-Based", "Communication", "Deduction"]
    },
    {
      name: "Ticket to Ride",
      category: "Family",
      players: "2-5",
      duration: "60 min",
      image: "Assets/Images/Ticket to Ride.jpg",
      description: "Collect colored train cards and claim railway routes to connect cities across the map.",
      tags: ["Route Building", "Set Collection"]
    },
    {
      name: "Pandemic",
      category: "Cooperative",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Pandemic.webp",
      description: "Work as a team to stop four diseases from spreading around the world.",
      tags: ["Action Point Allowance", "Hand Management", "Player Powers"]
    },
    {
      name: "Pandemic: Rapid Response",
      category: "Cooperative",
      players: "2-4",
      duration: "20 min",
      image: "Assets/Images/Pandemic Rapid Response.jpg",
      description: "Roll dice against the clock to fly supplies to cities in crisis. A fast, real-time spin-off of Pandemic.",
      tags: ["Real-Time", "Dice Rolling", "Crisis Management"]
    },
    {
      name: "Azul",
      category: "Abstract",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Azul.jpg",
      description: "Draft colored tiles and arrange them into a mosaic wall. Tiles you can't place cost you points.",
      tags: ["Pattern Building", "Drafting"]
    },
    {
      name: "7 Wonders",
      category: "Strategy",
      players: "3-7",
      duration: "30 min",
      image: "Assets/Images/7 Wonders.jpg",
      description: "Draft cards over three ages to build an ancient city through science, trade and war.",
      tags: ["Card Drafting", "Set Collection", "Engine Building"]
    },
    {
      name: "7 Wonders Duel",
      category: "Card Game",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/7 Wonders Duel.webp",
      description: "The two-player version of 7 Wonders, with its own card pyramid and new ways to win.",
      tags: ["Card Drafting", "Two Player", "Civ Building"]
    },
    {
      name: "Exploding Kittens",
      category: "Party",
      players: "2-5",
      duration: "15 min",
      image: "Assets/Images/Exploding Kittens.jpg",
      description: "A quick card game where drawing an exploding kitten knocks you out, unless you can defuse it.",
      tags: ["Player Elimination", "Push Your Luck"]
    },
    {
      name: "Dixit",
      category: "Party",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/Dixit.jpg",
      description: "Describe a dreamlike picture card in a word or phrase, then hope some players guess it, but not all of them.",
      tags: ["Storytelling", "Voting", "Creativity"]
    },
    {
      name: "Jenga",
      category: "Dexterity",
      players: "1-8",
      duration: "15-20 min",
      image: "Assets/Images/Jenga.jpg",
      description: "Pull a block from the tower and stack it on top without knocking everything over.",
      tags: ["Stacking", "Tension", "Hand-Eye Coordination"]
    },
    {
      name: "Welcome to Your Perfect Home",
      category: "Family",
      players: "1-100",
      duration: "25 min",
      image: "Assets/Images/Welcome to Your Perfect Home.jpg",
      description: "Write house numbers in order down your streets to plan the best 1950s-style neighborhood.",
      tags: ["Flip and Write", "Number Placement"]
    },
    {
      name: "Wingspan",
      category: "Strategy",
      players: "1-5",
      duration: "40-70 min",
      image: "Assets/Images/Wingspan.jpg",
      description: "Attract birds to your wildlife preserve and chain their powers into bigger and bigger combos.",
      tags: ["Engine Building", "Card Drafting", "Set Collection"]
    },
    {
      name: "Risk",
      category: "Strategy",
      players: "2-6",
      duration: "60-120 min",
      image: "Assets/Images/Risk.jpg",
      description: "Roll dice to attack your neighbors and take over the world, one territory at a time.",
      tags: ["Area Control", "Dice Rolling", "Elimination"]
    },
    {
      name: "Risk Europe",
      category: "Strategy",
      players: "2-4",
      duration: "120 min",
      image: "Assets/Images/Risk Europe.jpg",
      description: "Lead medieval armies across Europe and balance your money against your battles.",
      tags: ["Area Control", "Dice Rolling", "War Game"]
    },
    {
      name: "Patchwork",
      category: "Abstract",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/Patchwork.jpg",
      description: "Two players sew a quilt from Tetris-like patches, paying with buttons and time.",
      tags: ["Tile Placement", "Tetris-Like", "Resource Management"]
    },
    {
      name: "Secret Hitler",
      category: "Party",
      players: "5-10",
      duration: "45 min",
      image: "Assets/Images/Secret Hitler.jpg",
      description: "A hidden-role game of 1930s politics. The liberal majority tries to spot the liars before the fascists take over.",
      tags: ["Hidden Roles", "Bluffing", "Deduction"]
    },
    {
      name: "Camel Up",
      category: "Party",
      players: "2-8",
      duration: "30 min",
      image: "Assets/Images/Camel Up.webp",
      description: "Bet on a camel race where the camels stack on top of each other and the leader can change every turn.",
      tags: ["Betting", "Racing", "Dice Rolling"]
    },
    {
      name: "Splendor",
      category: "Strategy",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Splendor.jpg",
      description: "Collect gems and buy cards that give you permanent discounts. Get enough and nobles come to visit.",
      tags: ["Engine Building", "Set Collection", "Card Drafting"]
    },
    {
      name: "Splendor Duel",
      category: "Card Game",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/Splendor Duel.jpg",
      description: "A two-player take on Splendor with a shared gem board and more ways to mess with your opponent.",
      tags: ["Engine Building", "Card Drafting", "Two Player"]
    },
    {
      name: "That's You",
      category: "Party",
      players: "2-6",
      duration: "20-60 min",
      image: "Assets/Images/Thats You.png",
      description: "Answer questions about the people around the table and find out who knows the group best.",
      tags: ["Social", "Mobile Integration", "Humor"]
    },
    {
      name: "Forest Shuffle",
      category: "Strategy",
      players: "2-4",
      duration: "40-60 min",
      image: "Assets/Images/Forest Shuffle.jpg",
      description: "Play trees, then tuck animals and plants around them to grow the richest forest.",
      tags: ["Card Drafting", "Nature-Themed", "Set Collection"]
    },
    {
      name: "Happy Salmon",
      category: "Party",
      players: "3-6",
      duration: "2-5 min",
      image: "Assets/Images/Happy Salmon.png",
      description: "Everyone plays at once, shouting actions and hunting for a match so they can ditch their cards first.",
      tags: ["Real-Time", "Party Game", "High Energy"]
    },    
    {
      name: "Love Letter",
      category: "Card Game",
      players: "2-4",
      duration: "20 min",
      image: "Assets/Images/Love Letter.jpg",
      description: "A tiny card game of deduction and luck. Get your letter to the princess before anyone else does.",
      tags: ["Hand Management", "Deduction", "Player Elimination"]
    },
    {
      name: "King of Tokyo",
      category: "Party",
      players: "2-6",
      duration: "30 min",
      image: "Assets/Images/King of Tokyo.jpg",
      description: "Play a giant monster, roll dice to smash the others, and try to hold on to Tokyo.",
      tags: ["Dice Rolling", "Player Elimination", "Push Your Luck"]
    },
    {
      name: "Tokaido",
      category: "Family",
      players: "2-5",
      duration: "45 min",
      image: "Assets/Images/Tokaido.jpg",
      description: "A slow, peaceful trip along the old Tokaido road in Japan, stopping for hot springs, meals and souvenirs.",
      tags: ["Point to Point Movement", "Set Collection", "Relaxing"]
    },
    {
      name: "The Mind",
      category: "Party",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/The Mind.jpg",
      description: "Play your numbered cards in rising order as a team, without saying a word.",
      tags: ["Cooperative", "Hand Management", "Timing"]
    },
    {
      name: "Cluedo",
      category: "Family",
      players: "3-6",
      duration: "45 min",
      image: "Assets/Images/Cluedo.jpg",
      description: "Work out who killed Dr. Black, in which room, and with which weapon.",
      tags: ["Deduction", "Roll and Move", "Mystery"]
    },
    {
      name: "Onitama",
      category: "Abstract",
      players: "2",
      duration: "15-20 min",
      image: "Assets/Images/Onitama.jpg",
      description: "A quick two-player game where move cards pass back and forth, so every move you make hands one to your opponent.",
      tags: ["Abstract Strategy", "Perfect Information", "Grid Movement"]
    },
    {
      name: "Terraforming Mars",
      category: "Strategy",
      players: "1-5",
      duration: "120 min",
      image: "Assets/Images/Terraforming Mars.jpg",
      description: "Run a corporation that helps make Mars livable, and build a card engine that earns you more each round.",
      tags: ["Engine Building", "Card Drafting", "Resource Management"]
    },
    {
      name: "Terraforming Mars: Ares Expedition",
      category: "Strategy",
      players: "1-4",
      duration: "45-75 min",
      image: "Assets/Images/Terraforming Mars Ares.jpg",
      description: "A faster, card-only version of Terraforming Mars where players choose which phases happen each round.",
      tags: ["Engine Building", "Card Game", "Science Fiction"]
    },
    {
      name: "Coup",
      category: "Bluffing",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Coup.jpg",
      description: "Claim any role you like, true or not, and knock out the other players until you're the last one standing.",
      tags: ["Bluffing", "Player Elimination", "Hidden Roles"]
    },
    {
      name: "Wavelength",
      category: "Party",
      players: "2-12",
      duration: "30-45 min",
      image: "Assets/Images/Wavelength.jpg",
      description: "One player gives a clue, and their team turns a dial to guess where it sits on a scale like 'hot to cold'.",
      tags: ["Team-Based", "Communication", "Social"]
    },
    {
      name: "Great Western Trail",
      category: "Strategy",
      players: "2-4",
      duration: "75-150 min",
      image: "Assets/Images/Great Western Trail.webp",
      description: "Drive cattle across the Old West to Kansas City and ship them off by rail for profit.",
      tags: ["Deck-Building", "Route Building", "Economic"]
    },
    {
      name: "The Crew: The Quest for Planet Nine",
      category: "Cooperative",
      players: "2-5",
      duration: "20 min",
      image: "Assets/Images/The Crew_Planet Nine.jpg",
      description: "A co-op trick-taking game in space. Complete each mission while barely talking to your team.",
      tags: ["Trick-Taking", "Mission-Based", "Limited Communication"]
    },
    {
      name: "Spyfall",
      category: "Bluffing",
      players: "3-8",
      duration: "15 min",
      image: "Assets/Images/Spyfall.webp",
      description: "Everyone knows the secret location except the spy. Ask questions to find them, or bluff your way through if you're the spy.",
      tags: ["Social Deduction", "Bluffing", "Hidden Roles"]
    },
    {
      name: "Menace Among Us",
      category: "Bluffing",
      players: "4-8",
      duration: "45-60 min",
      image: "Assets/Images/Menace Among Us.jpg",
      description: "Repair your spaceship as a crew while hidden traitors try to sabotage it.",
      tags: ["Hidden Roles", "Deduction", "Cooperative", "Bluffing"]
    },
    {
      name: "Hellapagos",
      category: "Cooperative",
      players: "3-12",
      duration: "20-30 min",
      image: "Assets/Images/Hellapagos.jpg",
      description: "Shipwrecked players work together to build a raft and escape the island, until the food and water run low and someone gets voted off.",
      tags: ["Cooperative", "Survival", "Negotiation", "Backstabbing"]
    },
    {
      name: "Dream Home",
      category: "Family",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Dream Home.jpg",
      description: "Pick cards to build your house and furnish it room by room.",
      tags: ["Set Collection", "Drafting", "Family Friendly"]
    },
    {
      name: "Baobab",
      category: "Dexterity",
      players: "2-4",
      duration: "15 min",
      image: "Assets/Images/Baobab.jpg",
      description: "Stack animal cards on a tree without letting any fall. Each animal has its own placement rule.",
      tags: ["Stacking", "Animal Theme", "Party"]
    },
    {
      name: "Tapestry",
      category: "Strategy",
      players: "1-5",
      duration: "90-120 min",
      image: "Assets/Images/Tapestry.jpg",
      description: "Guide a civilization through history by advancing in science, technology, exploration and military.",
      tags: ["Civilization Building", "Engine Building", "Asymmetric Powers"]
    },
    {
      name: "Everdell",
      category: "Strategy",
      players: "1-4",
      duration: "40-80 min",
      image: "Assets/Images/Everdell.png",
      description: "Build a city of woodland critters and buildings over four seasons.",
      tags: ["Worker Placement", "Tableau Building", "Card Drafting"]
    },
    {
      name: "Downforce",
      category: "Family",
      players: "2-6",
      duration: "30-45 min",
      image: "Assets/Images/Downforce.jpg",
      description: "Bid on race cars, play speed cards and place secret bets on who'll win the race.",
      tags: ["Betting", "Hand Management", "Racing"]
    },
    {
      name: "My City",
      category: "Family",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/My City.jpg",
      description: "A legacy game by Reiner Knizia. You build your city with tiles, and it changes from one game to the next.",
      tags: ["Legacy", "Tile Placement", "City Building"]
    },
    {
      name: "Barenpark",
      category: "Family",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Barenpark.jpeg",
      description: "Fill your bear park with polyomino tiles of enclosures, kiosks and paths.",
      tags: ["Tile Placement", "Tetris-Like", "Set Collection"]
    },
    {
      name: "Blue Lagoon",
      category: "Family",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Blue Lagoon.webp",
      description: "Explore a chain of islands and settle it, scoring for connected villages and the resources you gather.",
      tags: ["Area Control", "Set Collection", "Abstract"]
    },
    {
      name: "Reef",
      category: "Abstract",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Reef.jpg",
      description: "Stack colorful coral pieces on your reef to match the patterns on your cards.",
      tags: ["Pattern Building", "Stacking", "Family Friendly"]
    },
    {
      name: "Wombat",
      category: "Family",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Wombat.jpg",
      description: "Help the wombats dig their tunnels and find their way through them.",
      tags: ["Animal Theme", "Movement", "Kids"]
    },
    {
      name: "Marrakech",
      category: "Abstract",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Marrakech.jpg",
      description: "Lay carpets around the market square. When other players land on yours, they pay you.",
      tags: ["Tile Placement", "Area Influence", "Economic"]
    },
    {
      name: "Dragon Market",
      category: "Family",
      players: "2-4",
      duration: "30-45 min",
      image: "Assets/Images/Dragon Market.jpg",
      description: "Move through a floating market of shifting boats to collect the items you need.",
      tags: ["Grid Movement", "Pickup and Deliver", "Strategy"]
    },
    {
      name: "Quixo",
      category: "Abstract",
      players: "2 or 4",
      duration: "15-20 min",
      image: "Assets/Images/Quixo.webp",
      description: "Slide cubes into the grid from the edges to get five of your symbols in a row.",
      tags: ["Abstract Strategy", "Alignment", "Quick Play"]
    },
    {
      name: "Pylos",
      category: "Abstract",
      players: "2",
      duration: "20 min",
      image: "Assets/Images/Pylos.jpeg",
      description: "Stack spheres into a pyramid and save your pieces. Whoever places the top sphere wins.",
      tags: ["Abstract Strategy", "3D", "Tactical"]
    },
    {
      name: "Quoridor",
      category: "Abstract",
      players: "2-4",
      duration: "15-30 min",
      image: "Assets/Images/Quoridor.jpg",
      description: "Race your pawn to the far side of the board while placing walls to slow everyone else down.",
      tags: ["Maze", "Blocking", "Abstract Strategy"]
    },
    {
      name: "Game of Cat and Mouth",
      category: "Dexterity",
      players: "2",
      duration: "10-15 min",
      image: "Assets/Images/Game of Cat and Mouth.webp",
      description: "Use the magnetic cat paw to flick balls over to your opponent's side.",
      tags: ["Flicking", "Dexterity", "Real-Time"]
    },
    {
      name: "Blokus",
      category: "Abstract",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Blokus.webp",
      description: "Fit as many of your pieces on the board as you can, touching only at the corners, and box your opponents in.",
      tags: ["Tile Placement", "Spatial Reasoning", "Abstract Strategy"]
    },
    {
      name: "Jaipur",
      category: "Card Game",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/Jaipur.jpg",
      description: "A two-player trading game set in a busy Indian market. Sell your goods at the right moment and grab camels when you need them.",
      tags: ["Trading", "Set Collection", "Hand Management"]
    },
    {
      name: "Schotten Totten",
      category: "Card Game",
      players: "2",
      duration: "20 min",
      image: "Assets/Images/Schotten Totten.jpeg",
      description: "Two players fight over nine stones by building poker-style card formations on each side.",
      tags: ["Hand Management", "Area Control", "Bluffing"]
    },
    {
      name: "Tacocat Spelled Backwards",
      category: "Party",
      players: "2",
      duration: "15-20 min",
      image: "Assets/Images/Tacocat Spelled Backwards.webp",
      description: "A two-player tug-of-war card game themed around palindromes, with a bit of bluffing.",
      tags: ["Bluffing", "Card Game", "Humor"]
    },
    {
      name: "Raise Your Goblets",
      category: "Bluffing",
      players: "2-12",
      duration: "30-45 min",
      image: "Assets/Images/Raise Your Goblets.jpg",
      description: "Slip poison into the goblets, swap them around and toast. Take out your enemies without getting caught.",
      tags: ["Bluffing", "Deduction", "Party"]
    },
    {
      name: "Kingdomino",
      category: "Family",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Kingdomino.jpg",
      description: "Pick domino tiles and connect matching terrain to build a 5x5 kingdom.",
      tags: ["Tile Placement", "Drafting", "Spatial"]
    },
    {
      name: "Cacao",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Cacao.webp",
      description: "Place worker and jungle tiles to grow cacao, then sell it at the best price you can get.",
      tags: ["Tile Placement", "Resource Management", "Economic"]
    },
    {
      name: "Game of Life",
      category: "Family",
      players: "2-6",
      duration: "60 min",
      image: "Assets/Images/Game of Life.jpeg",
      description: "Spin the wheel and drive through life, picking a career, starting a family and chasing a fortune.",
      tags: ["Roll and Move", "Life Simulation", "Classic"]
    },
    {
      name: "Dream On",
      category: "Party",
      players: "2-8",
      duration: "20 min",
      image: "Assets/Images/Dream On.jpeg",
      description: "Build a dream together from cards, then try to remember it in the right order.",
      tags: ["Memory", "Storytelling", "Cooperative"]
    },
    {
      name: "Bang! The Dice Game",
      category: "Party",
      players: "3-8",
      duration: "15-20 min",
      image: "Assets/Images/Bang The Dice.jpg",
      description: "A faster dice version of Bang!. Roll to shoot, heal and find the hidden outlaws.",
      tags: ["Dice Rolling", "Hidden Roles", "Bluffing"]
    },
    {
      name: "Bang! The Bullet",
      category: "Party",
      players: "3-8",
      duration: "20-40 min",
      image: "Assets/Images/Bang The Bullet.webp",
      description: "A deluxe edition of the Wild West card game Bang!, with hidden roles, bluffing and plenty of shooting.",
      tags: ["Bluffing", "Hidden Roles", "Western"]
    },
    {
      name: "Fun Facts",
      category: "Party",
      players: "4-8",
      duration: "20-30 min",
      image: "Assets/Images/Fun Facts.jpg",
      description: "Find out surprising things about your friends in a light party game.",
      tags: ["Guessing", "Social", "Icebreaker"]
    },
    {
      name: "Concept",
      category: "Party",
      players: "4-12",
      duration: "40 min",
      image: "Assets/Images/Concept.webp",
      description: "Place markers on a board of icons to get your team to guess a word or phrase.",
      tags: ["Word Game", "Abstract", "Team-Based"]
    },
    {
      name: "Go Cuckoo",
      category: "Dexterity",
      players: "2-5",
      duration: "15 min",
      image: "Assets/Images/Go Cuckoo.jpg",
      description: "Build a nest of sticks and place eggs in it without making anything fall.",
      tags: ["Dexterity", "Balancing", "Kids"]
    },
    {
      name: "Take 6",
      category: "Card Game",
      players: "2-10",
      duration: "30 min",
      image: "Assets/Images/Take 6.jpg",
      description: "Play numbered cards into rows and try not to collect the bullheads that come with a full row.",
      tags: ["Hand Management", "Number Game", "Set Collection"]
    },
    {
      name: "Spirits of the Forest",
      category: "Abstract",
      players: "1-4",
      duration: "20-30 min",
      image: "Assets/Images/Spirits of the Forest.webp",
      description: "Collect sets of spirit tiles while managing your gems and blocking your opponents.",
      tags: ["Set Collection", "Abstract Strategy", "Tile Drafting"]
    },
    {
      name: "Skull",
      category: "Bluffing",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/Skull.jpg",
      description: "A bluffing game played with coasters. Bid on how many flowers you can reveal without hitting a skull.",
      tags: ["Bluffing", "Risk Management", "Deduction"]
    },
    {
      name: "Room 25",
      category: "Thematic",
      players: "1-6",
      duration: "30-60 min",
      image: "Assets/Images/Room 25.webp",
      description: "Escape a maze of deadly rooms full of traps, while some players might be secretly working against you.",
      tags: ["Hidden Traitor", "Modular Board", "Action Programming"]
    },
    {
      name: "Ramen Fury",
      category: "Card Game",
      players: "2-5",
      duration: "15-20 min",
      image: "Assets/Images/Ramen Fury.webp",
      description: "Draft ingredients to build the tastiest bowls of ramen, and don't forget the seasoning.",
      tags: ["Drafting", "Set Collection", "Food Theme"]
    },
    {
      name: "Bag of Chips",
      category: "Party",
      players: "2-5",
      duration: "20 min",
      image: "Assets/Images/Bag of Chips.webp",
      description: "Bet on which chips come out of the bag in this quick push-your-luck game.",
      tags: ["Betting", "Push Your Luck", "Drafting"]
    },
    {
      name: "Waroong Wars",
      category: "Family",
      players: "2-5",
      duration: "30-45 min",
      image: "Assets/Images/Waroong Wars.png",
      description: "Build up your Indonesian food stall and serve the customers who come by.",
      tags: ["Resource Management", "Set Collection", "Local Theme"]
    },
    {
      name: "Cabo",
      category: "Card Game",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Cabo.jpg",
      description: "Remember your hidden cards and swap them out to finish with the lowest score.",
      tags: ["Memory", "Deduction", "Card Game"]
    },
    {
      name: "Subastral",
      category: "Strategy",
      players: "2-5",
      duration: "30-45 min",
      image: "Assets/Images/Subastral.png",
      description: "Travel through Earth's biomes and draft cards to fill your journal.",
      tags: ["Set Collection", "Drafting", "Nature Theme"]
    },
    {
      name: "Inside Job",
      category: "Bluffing",
      players: "3-5",
      duration: "20 min",
      image: "Assets/Images/Inside Job.webp",
      description: "A hidden-role game where a secret agent blends in with coworkers and sabotages their missions.",
      tags: ["Hidden Roles", "Deduction", "Cooperative"]
    },
    {
      name: "Boy Who Cried Wolf",
      category: "Party",
      players: "3-6",
      duration: "15-20 min",
      image: "Assets/Images/Boy Who Cried Wolf.webp",
      description: "A storytelling and bluffing game based on the old fable.",
      tags: ["Bluffing", "Storytelling", "Family"]
    },
    {
      name: "Dice Academy",
      category: "Party",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Dice Academy.jpg",
      description: "Roll the letter and category dice, then race to name something that fits both.",
      tags: ["Speed Game", "Dice Rolling", "Word Game"]
    },
    {
      name: "Dog Rush",
      category: "Dexterity",
      players: "2-6",
      duration: "10-15 min",
      image: "Assets/Images/Dog Rush.jpg",
      description: "Spot which dog is tangled in the leashes before anyone else does.",
      tags: ["Observation", "Speed", "Pattern Recognition"]
    },
    {
      name: "Taco Cat Goat Cheese Pizza",
      category: "Party",
      players: "3-8",
      duration: "10-15 min",
      image: "Assets/Images/Taco Cat Goat Cheese Pizza.jpg",
      description: "Say the words in order as you flip cards, and slap the pile when the card matches the word.",
      tags: ["Speed Game", "Party", "Reflex"]
    },
    {
      name: "Mimiq",
      category: "Party",
      players: "2-6",
      duration: "10-15 min",
      image: "Assets/Images/Mimiq.jpg",
      description: "Copy facial expressions and read other players' faces to collect matching sets.",
      tags: ["Memory", "Facial Expression", "Kids"]
    },
    {
      name: "Sekata",
      category: "Word Game",
      players: "2-6",
      duration: "20-30 min",
      image: "Assets/Images/Sekata.png",
      description: "Guess the same word as your teammate from a single clue.",
      tags: ["Team-Based", "Word Guessing", "Communication"]
    },
    {
      name: "Who Did It?",
      category: "Party",
      players: "3-6",
      duration: "15 min",
      image: "Assets/Images/Who Did It.jpg",
      description: "Blame your friends' pets for the mess before they blame yours.",
      tags: ["Bluffing", "Memory", "Reaction"]
    },
    {
      name: "Shadows Amsterdam",
      category: "Deduction",
      players: "2-8",
      duration: "20 min",
      image: "Assets/Images/Shadows Amsterdam.avif",
      description: "Give picture clues to lead your team's detectives through Amsterdam, racing the other team in real time.",
      tags: ["Deduction", "Real-Time", "Wordless Clues"]
    },
    {
      name: "Trial by Trolley",
      category: "Bluffing",
      players: "3-13",
      duration: "30 min",
      image: "Assets/Images/Trial by Trolley.jpg",
      description: "A dark comedy about the trolley problem. Argue over who the runaway trolley should hit.",
      tags: ["Debate", "Bluffing", "Dark Humor"]
    },
    {
      name: "Dobble",
      category: "Party",
      players: "2-8",
      duration: "15 min",
      image: "Assets/Images/Dobble.jpg",
      description: "Any two cards share exactly one symbol. Be the first to spot it.",
      tags: ["Observation", "Speed", "Reflex"]
    },
    {
      name: "Yogi",
      category: "Party",
      players: "3-10",
      duration: "15-20 min",
      image: "Assets/Images/Yogi.jpg",
      description: "Hold the awkward poses on your cards, and keep holding them as more cards pile up.",
      tags: ["Dexterity", "Physical", "Silly Fun"]
    },
    {
      name: "Mascarade",
      category: "Bluffing",
      players: "2-13",
      duration: "30 min",
      image: "Assets/Images/Mascarade.jpg",
      description: "Swap role cards face down until nobody is sure who they are, then claim a role and hope you're right.",
      tags: ["Hidden Roles", "Memory", "Bluffing"]
    },
    {
      name: "Scape Goat",
      category: "Bluffing",
      players: "3-6",
      duration: "20-30 min",
      image: "Assets/Images/Scape Goat.webp",
      description: "One player is the scapegoat. Can they work it out before the others frame them?",
      tags: ["Deduction", "Hidden Identity", "Bluffing"]
    },
    {
      name: "Avalon",
      category: "Bluffing",
      players: "5-10",
      duration: "30 min",
      image: "Assets/Images/Avalon.jpg",
      description: "Loyal knights of King Arthur try to complete quests while Mordred's hidden agents work against them.",
      tags: ["Social Deduction", "Bluffing", "Team-Based"]
    },
    {
      name: "Two Rooms and a Boom",
      category: "Party",
      players: "6-30",
      duration: "15-20 min",
      image: "Assets/Images/Two Rooms and a Boom.webp",
      description: "Split into two rooms, trade hostages, and work out who has the bomb and who's the president.",
      tags: ["Hidden Roles", "Social Deduction", "Party"]
    },
    {
      name: "Here to Slay",
      category: "Strategy",
      players: "2-6",
      duration: "30-60 min",
      image: "Assets/Images/Here to Slay.jpg",
      description: "Build a party of heroes to slay monsters, or sabotage your rivals instead.",
      tags: ["Set Collection", "Card Game", "Take That"]
    },
    {
      name: "Werewolf Deluxe",
      category: "Party",
      players: "8-35",
      duration: "30-45 min",
      image: "Assets/Images/Werewolf Deluxe.webp",
      description: "The classic village game. Find the werewolves hiding among you before they get everyone.",
      tags: ["Social Deduction", "Hidden Roles", "Bluffing"]
    },
    {
      name: "One Night Ultimate Werewolf",
      category: "Social Deduction",
      players: "3-10",
      duration: "10 min",
      image: "Assets/Images/One Night Ultimate Werewolf.jpg",
      description: "One night, one vote. Work out who the werewolf is in about ten minutes.",
      tags: ["Hidden Roles", "Bluffing", "Party Game"]
    },
    {
      name: "Hamster Clan",
      category: "Family",
      players: "1-4",
      duration: "15-20 min",
      image: "Assets/Images/Hamster Clan.jpg",
      description: "Help the hamster family gather food for winter by moving through their tunnels.",
      tags: ["Kids", "Movement", "Cooperative"]
    },
    {
      name: "Animal Upon Animal",
      category: "Dexterity",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Animal Upon Animal.jpg",
      description: "Stack wooden animals into a wobbly pile. Good for all ages.",
      tags: ["Stacking", "Dexterity", "Kids"]
    },
    {
      name: "Texas Hold'em Set",
      category: "Card Game",
      players: "2-10",
      duration: "30-90 min",
      image: "Assets/Images/Texas Holdem.jpg",
      description: "Everything you need for Texas Hold'em: chips, cards and a good poker face.",
      tags: ["Betting", "Bluffing", "Card Game"]
    },
    {
      name: "Bendomino",
      category: "Family",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Bendomino.webp",
      description: "Dominoes with curved tiles, so you have to plan where the line can bend.",
      tags: ["Tile Placement", "Domino", "Abstract"]
    },
    {
      name: "One Key",
      category: "Cooperative",
      players: "2-6",
      duration: "20 min",
      image: "Assets/Images/One Key.jpg",
      description: "Work together to find the one key image from abstract clues before time runs out.",
      tags: ["Deduction", "Team-Based", "Clue Giving"]
    },
    {
      name: "Stella",
      category: "Party",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/Stella.webp",
      description: "Link words to dreamy pictures in a game set in the Dixit world.",
      tags: ["Word Association", "Creativity", "Deduction"]
    },
    {
      name: "Catch the Moon",
      category: "Dexterity",
      players: "2-6",
      duration: "20 min",
      image: "Assets/Images/Catch the Moon.png",
      description: "Balance ladders on top of each other to climb toward the moon without knocking any down.",
      tags: ["Dexterity", "Balancing", "Tension"]
    },
    {
      name: "Canvas",
      category: "Strategy",
      players: "1-5",
      duration: "30 min",
      image: "Assets/Images/Canvas.webp",
      description: "Layer transparent cards to make a painting that scores for both looks and points.",
      tags: ["Set Collection", "Art", "Drafting"]
    },
    {
      name: "So Clover!",
      category: "Word Game",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/So Clover.webp",
      description: "Write clues that link pairs of words, then work together to solve each other's clovers.",
      tags: ["Cooperative", "Word Game", "Clue Giving"]
    },
    {
      name: "Slide Quest",
      category: "Dexterity",
      players: "1-4",
      duration: "20-30 min",
      image: "Assets/Images/Slide Quest.jpg",
      description: "Tilt the board together to guide a knight past the traps.",
      tags: ["Cooperative", "Dexterity", "Adventure"]
    },
    {
      name: "Goblet Gobblers",
      category: "Abstract",
      players: "2",
      duration: "5-10 min",
      image: "Assets/Images/Goblet Gobblers.jpg",
      description: "Tic-tac-toe where bigger pieces can swallow smaller ones.",
      tags: ["Abstract Strategy", "Tic Tac Toe", "Blocking"]
    },
    {
      name: "Gummi Land",
      category: "Family",
      players: "2-4",
      duration: "15-30 min",
      image: "Assets/Images/Gummi Land.jpg",
      description: "Collect colorful gummies and fill the orders.",
      tags: ["Set Collection", "Kids", "Pattern Matching"]
    },
    {
      name: "Mr Wolf",
      category: "Cooperative",
      players: "1-4",
      duration: "15-20 min",
      image: "Assets/Images/Mr Wolf.jpg",
      description: "Work together to get the animals into their barns before the wolf arrives.",
      tags: ["Memory", "Cooperative", "Kids"]
    },
    {
      name: "Happy Bunny",
      category: "Cooperative",
      players: "1-4",
      duration: "15 min",
      image: "Assets/Images/Happy Bunny.jpg",
      description: "Help the bunny pick only the ripe carrots for the farmer's basket.",
      tags: ["Memory", "Cooperative", "Kids"]
    },
    {
      name: "Harvest Dice",
      category: "Strategy",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Harvest Dice.jpg",
      description: "A roll-and-write where you draft dice to plant crops and keep your pig fed.",
      tags: ["Dice Rolling", "Roll and Write", "Set Collection"]
    },
    {
      name: "No Thanks",
      category: "Card Game",
      players: "3-7",
      duration: "20 min",
      image: "Assets/Images/No Thanks.jpg",
      description: "Each turn you take the card or pay a chip to pass it on. Easy to learn, with tough choices.",
      tags: ["Push Your Luck", "Card Game", "Minimalist"]
    },
    {
      name: "Halli Galli",
      category: "Party",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Halli Galli.png",
      description: "Ring the bell as soon as you see exactly five of one fruit.",
      tags: ["Reaction", "Speed", "Pattern Recognition"]
    },
    {
      name: "Geistes Blitz",
      category: "Party",
      players: "2-8",
      duration: "20 min",
      image: "Assets/Images/Geistes Blitz.jpg",
      description: "Grab the right wooden object first, based on what is (and isn't) pictured on the card.",
      tags: ["Speed Game", "Reflex", "Observation"]
    },
    {
      name: "Jungle Speed Safari",
      category: "Party",
      players: "2-6",
      duration: "15-20 min",
      image: "Assets/Images/Jungle Speed Safari.jpg",
      description: "A wilder Jungle Speed with animal noises and reflex challenges.",
      tags: ["Reflex", "Party", "Animal Theme"]
    },
    {
      name: "Cookie Box",
      category: "Dexterity",
      players: "2-4",
      duration: "15 min",
      image: "Assets/Images/Cookie Box.webp",
      description: "Race to stack and arrange cookies and boxes before your friends do.",
      tags: ["Stacking", "Speed", "Kids"]
    },
    {
      name: "Bears in Barrels",
      category: "Party",
      players: "2-4",
      duration: "10-15 min",
      image: "Assets/Images/Bears in Barrels.jpg",
      description: "Wind up the bears and race them across the table.",
      tags: ["Dexterity", "Wind-Up Toys", "Racing"]
    },
    {
      name: "Felicity: The Cat in the Sack",
      category: "Bluffing",
      players: "3-5",
      duration: "20-30 min",
      image: "Assets/Images/Felicity.jpg",
      description: "Bid blind on sacks of mystery cats and try not to end up with the dogs.",
      tags: ["Auction", "Bluffing", "Set Collection"]
    },
    {
      name: "Bam Bam Race",
      category: "Dexterity",
      players: "2-4",
      duration: "10-15 min",
      image: "Assets/Images/Bam Bam Race.webp",
      description: "Slam the pawn to send your car racing across the floor.",
      tags: ["Dexterity", "Racing", "Kids"]
    },
    {
      name: "Cat Lady",
      category: "Card Game",
      players: "2-4",
      duration: "20-30 min",
      image: "Assets/Images/Cat Lady.png",
      description: "Collect cats, plus the food, toys and costumes to keep them happy.",
      tags: ["Set Collection", "Drafting", "Cute Theme"]
    },
    {
      name: "Mantis",
      category: "Card Game",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Mantis.webp",
      description: "A colorful card-stealing game from the makers of Exploding Kittens.",
      tags: ["Stealing", "Set Collection", "Color Matching"]
    },
    {
      name: "Crash Octopus",
      category: "Dexterity",
      players: "2-5",
      duration: "30 min",
      image: "Assets/Images/Crash Octopus.webp",
      description: "Flick your boat to grab treasure while dodging a giant octopus.",
      tags: ["Flicking", "Dexterity", "Modular Board"]
    },
    {
      name: "Smile",
      category: "Card Game",
      players: "3-5",
      duration: "30 min",
      image: "Assets/Images/Smile.jpg",
      description: "Catch cute creatures with your glowworms. Not all of them are friendly.",
      tags: ["Auction", "Set Collection", "Bluffing"]
    },
    {
      name: "Who Is It?",
      category: "Deduction",
      players: "2",
      duration: "15-20 min",
      image: "Assets/Images/Who Is It.jpg",
      description: "Ask yes-or-no questions to find your opponent's mystery character. Good for kids.",
      tags: ["Guessing", "Deduction", "Kids"]
    },
    {
      name: "Sheriff of Nottingham 1st Edition",
      category: "Bluffing",
      players: "3-5",
      duration: "45 min",
      image: "Assets/Images/Sheriff of Nottingham 1st.webp",
      description: "Smuggle goods past the Sheriff with a straight face, or play the Sheriff and decide who's lying.",
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
      description: "Roll dice and remember which colored eggs are hiding under which penguins.",
      tags: ["Memory", "Dice Rolling", "Animal Theme"]
    },
    {
      name: "Get Packing",
      category: "Puzzle",
      players: "1-4",
      duration: "15-30 min",
      image: "Assets/Images/Get Packing.jpg",
      description: "Fit all your vacation things into your suitcase before the other players do.",
      tags: ["Spatial Reasoning", "Puzzle", "Race"]
    },
    {
      name: "Meeple Circus",
      category: "Dexterity",
      players: "2-5",
      duration: "45 min",
      image: "Assets/Images/Meeple Circus.jpg",
      description: "Stack and balance meeples into daring circus acts.",
      tags: ["Stacking", "Dexterity", "Timed"]
    },
    {
      name: "Panic Mansion",
      category: "Dexterity",
      players: "2-4",
      duration: "20 min",
      image: "Assets/Images/Panic Mansion.jpg",
      description: "Shake your box to move the right items into the right rooms first.",
      tags: ["Real-Time", "Dexterity", "Speed"]
    },
    {
      name: "Peek-A-Mouse",
      category: "Kids",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Peek a Mouse.jpg",
      description: "Spot which objects the mice borrowed while they're lit up.",
      tags: ["Memory", "Observation", "Flashlight"]
    },
    {
      name: "Tock Tock Woodman",
      category: "Dexterity",
      players: "2-7",
      duration: "10-15 min",
      image: "Assets/Images/Tock Tock Woodman.webp",
      description: "Chop the bark off the tree without knocking the trunk over.",
      tags: ["Dexterity", "Stacking", "Tension"]
    },
    {
      name: "Rhino Hero",
      category: "Family",
      players: "2-5",
      duration: "15 min",
      image: "Assets/Images/Rhino Hero.webp",
      description: "Build a card tower of walls and roofs while Rhino Hero climbs to the top.",
      tags: ["Stacking", "Dexterity", "Kids"]
    },
    {
      name: "Nyctophobia",
      category: "Horror",
      players: "3-5",
      duration: "30-45 min",
      image: "Assets/Images/Nyctophobia.jpg",
      description: "Play almost blind in blackout glasses and try to escape a hunter you can't see.",
      tags: ["Unique Mechanic", "Survival", "Cooperative"]
    },
    {
      name: "Chronicles of Crime",
      category: "Deduction",
      players: "1-4",
      duration: "60-90 min",
      image: "Assets/Images/Chronicles of Crime.jpg",
      description: "Scan QR codes with the app to search crime scenes and solve murders. VR is optional.",
      tags: ["Crime Solving", "Technology", "Story Driven"]
    },
    {
      name: "Unlock: Escape Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Escape Adventures.jpg",
      description: "An escape room in a box. Solve card puzzles together, with help from a free app.",
      tags: ["Escape Room", "Puzzle", "Cooperative"]
    },
    {
      name: "Unlock: Timeless Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Timeless Adventures.webp",
      description: "More Unlock escape rooms, with scenarios set in the past, present and future.",
      tags: ["Escape Room", "Time Travel", "Puzzle"]
    },
    {
      name: "Unlock: Heroic Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Heroic Adventures.jpg",
      description: "More Unlock escape scenarios with a heroic adventure theme.",
      tags: ["Puzzle", "Storytelling", "Adventure"]
    },
    {
      name: "Unlock: Exotic Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Exotic Adventures.jpg",
      description: "Three Unlock escape rooms in faraway settings.",
      tags: ["Escape Room", "Exploration", "Puzzle"]
    },
    {
      name: "Unlock: Mystery Adventures",
      category: "Puzzle",
      players: "1-6",
      duration: "60 min",
      image: "Assets/Images/Unlock Mystery Adventures.jpg",
      description: "Unlock escape rooms built around mysteries for your team to crack.",
      tags: ["Puzzle", "Mystery", "Narrative"]
    },
    {
      name: "Ark Nova",
      category: "Strategy",
      players: "1-4",
      duration: "90-150 min",
      image: "Assets/Images/Ark Nova.jpg",
      description: "Design a modern zoo and fund conservation projects. A long, deep strategy game.",
      tags: ["Engine Building", "Tile Placement", "Card Drafting"]
    },
    {
      name: "Celestia",
      category: "Family",
      players: "2-6",
      duration: "30 min",
      image: "Assets/Images/Celestia.avif",
      description: "Fly an airship between cities in the clouds. Stay on board for bigger rewards, or jump off before it crashes.",
      tags: ["Push Your Luck", "Bluffing", "Adventure"]
    },
    {
      name: "Cascadia",
      category: "Abstract",
      players: "1-4",
      duration: "30-45 min",
      image: "Assets/Images/Cascadia.jpg",
      description: "Lay habitat tiles and place wildlife tokens to build a corner of the Pacific Northwest.",
      tags: ["Tile Placement", "Pattern Building", "Nature"]
    },
    {
      name: "Point Salad",
      category: "Card Game",
      players: "2-6",
      duration: "15-30 min",
      image: "Assets/Images/Point Salad.png",
      description: "Draft veggies and the cards that score them. Each card can be used as either one.",
      tags: ["Card Drafting", "Set Collection", "Quick Play"]
    },
    {
      name: "Bohnanza",
      category: "Card Game",
      players: "2-7",
      duration: "45 min",
      image: "Assets/Images/Bohnanza.jpg",
      description: "Plant, trade and harvest beans, but you can't change the order of your hand.",
      tags: ["Trading", "Hand Management", "Set Collection"]
    },
    {
      name: "Tokyo Highway",
      category: "Dexterity",
      players: "2-4",
      duration: "30-50 min",
      image: "Assets/Images/Tokyo Highway.jpg",
      description: "Build highways from tiny pillars and road pieces, weaving over and under your opponent's.",
      tags: ["Dexterity", "Construction", "Precision"]
    },
    {
      name: "Awkward Guests",
      category: "Deduction",
      players: "1-8",
      duration: "45-75 min",
      image: "Assets/Images/Awkward Guests.webp",
      description: "Work out who killed Mr. Walton by trading clues with other players. The solution changes every game.",
      tags: ["Deduction", "Mystery", "Card Game"]
    },
    {
      name: "Citadels",
      category: "Strategy",
      players: "2-8",
      duration: "30-60 min",
      image: "Assets/Images/Citadels.jpg",
      description: "Pick a secret character each round and use its power to build your medieval city.",
      tags: ["Bluffing", "Role Selection", "City Building"]
    },
    {
      name: "Cockroach Poker",
      category: "Bluffing",
      players: "2-6",
      duration: "20 min",
      image: "Assets/Images/Cockroach Poker.png",
      description: "Pass a card face down and lie about which creature it is. Guess wrong when you call a bluff, and the card is yours.",
      tags: ["Bluffing", "Party", "Lying"]
    },
    {
      name: "Decrypto",
      category: "Word Game",
      players: "3-8",
      duration: "30 min",
      image: "Assets/Images/Decrypto.jpg",
      description: "Give clues so your team can decode a secret number, while the other team listens in and tries to crack it.",
      tags: ["Word Game", "Deduction", "Team-Based"]
    },
    {
      name: "Cubitos",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Cubitos.webp",
      description: "Roll dice cubes and push your luck to race your runner around the track.",
      tags: ["Dice Rolling", "Racing", "Push Your Luck"]
    },
    {
      name: "Saboteur",
      category: "Bluffing",
      players: "3-10",
      duration: "30 min",
      image: "Assets/Images/Saboteur.jpg",
      description: "Dig tunnels toward the gold together, unless you're secretly a saboteur.",
      tags: ["Hidden Roles", "Bluffing", "Team-Based"]
    },
    {
      name: "Chinatown",
      category: "Negotiation",
      players: "3-5",
      duration: "60 min",
      image: "Assets/Images/Chinatown.jpg",
      description: "Trade lots and make deals to build shops in 1960s New York. Almost everything is up for negotiation.",
      tags: ["Negotiation", "Economic", "Tile Placement"]
    },
    {
      name: "Cubeez",
      category: "Dexterity",
      players: "2-4",
      duration: "10-15 min",
      image: "Assets/Images/Cubeez.jpg",
      description: "Race to arrange cubes so their faces match the card.",
      tags: ["Pattern Recognition", "Speed", "Puzzle"]
    },
    {
      name: "Earth",
      category: "Strategy",
      players: "1-5",
      duration: "45-90 min",
      image: "Assets/Images/Earth.jpg",
      description: "Plant cards into your tableau and chain their abilities to grow an ecosystem.",
      tags: ["Engine Building", "Card Game", "Nature"]
    },
    {
      name: "Dice Forge",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Dice Forge.jpg",
      description: "Change the faces of your own dice as you play, then roll them to win favor with the gods.",
      tags: ["Dice Crafting", "Resource Management", "Mythology"]
    },
    {
      name: "Colt Express",
      category: "Family",
      players: "2-6",
      duration: "40 min",
      image: "Assets/Images/Colt Express.png",
      description: "Program your bandit's moves, then watch them play out on a 3D train as everyone tries to rob it.",
      tags: ["Action Programming", "Thematic", "Wild West"]
    },
    {
      name: "God of War: The Card Game",
      category: "Cooperative",
      players: "1-4",
      duration: "60-90 min",
      image: "Assets/Images/God of War.jpeg",
      description: "Team up as Norse heroes to fight monsters and change your fate.",
      tags: ["Cooperative", "Card Drafting", "Scenario-Based"]
    },
    {
      name: "Jamaica",
      category: "Family",
      players: "2-6",
      duration: "30-60 min",
      image: "Assets/Images/Jamaica.webp",
      description: "Race pirate ships around Jamaica, collecting treasure and fighting other pirates on the way.",
      tags: ["Racing", "Resource Management", "Pirates"]
    },
    {
      name: "Memoir '44",
      category: "Strategy",
      players: "2",
      duration: "30-60 min",
      image: "Assets/Images/Memoir 44.jpg",
      description: "Replay World War II battles with miniatures and command cards.",
      tags: ["Wargame", "Scenario-Based", "Tactical"]
    },
    {
      name: "Planet",
      category: "Abstract",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Planet.jpg",
      description: "Stick magnetic terrain tiles onto a 3D planet to build habitats for animals.",
      tags: ["Tile Placement", "3D", "Nature"]
    },
    {
      name: "Insider",
      category: "Party",
      players: "4-8",
      duration: "15-20 min",
      image: "Assets/Images/Insider.jpg",
      description: "One player secretly knows the answer and has to steer everyone toward it without getting caught.",
      tags: ["Hidden Roles", "Deduction", "Word Game"]
    },
    {
      name: "Letter from Whitechapel",
      category: "Deduction",
      players: "2-6",
      duration: "90 min",
      image: "Assets/Images/Letter from Whitechapel.webp",
      description: "Chase Jack the Ripper through the streets of London, or play as Jack and slip away.",
      tags: ["Hidden Movement", "Deduction", "Historical"]
    },
    {
      name: "Scout",
      category: "Card Game",
      players: "2-5",
      duration: "20 min",
      image: "Assets/Images/Scout.jpg",
      description: "A card game where you can't rearrange your hand. Play sets to beat the table, or take cards to build better ones.",
      tags: ["Ladder Climbing", "Hand Management", "Tactical"]
    },
    {
      name: "Speed Cups",
      category: "Dexterity",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Speed Cups.jpg",
      description: "Stack and arrange colored cups to match the card, then ring the bell first.",
      tags: ["Speed", "Pattern Matching", "Reflex"]
    },
    {
      name: "Sticky Chameleons",
      category: "Party",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Sticky Chameleons.jpg",
      description: "Use sticky tongues to snatch the right insect before everyone else.",
      tags: ["Dexterity", "Speed", "Kids"]
    },
    {
      name: "Survive: Escape from Atlantis!",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/Survive from Atlantis.jpg",
      description: "Get your people off a sinking island and past the sharks, whales and sea monsters.",
      tags: ["Survival", "Tile Removal", "Take That"]
    },
    {
      name: "Sushi Go Party!",
      category: "Card Game",
      players: "2-8",
      duration: "20 min",
      image: "Assets/Images/Sushi Go Party.jpg",
      description: "Pass hands of sushi cards around and pick dishes that score well together. This edition fits up to 8 players.",
      tags: ["Card Drafting", "Set Collection", "Family"]
    },
    {
      name: "Tussie Mussie",
      category: "Card Game",
      players: "1-4",
      duration: "20 min",
      image: "Assets/Images/Tussie Mussie.webp",
      description: "Offer flowers with hidden meanings and collect sets, with a little bluffing.",
      tags: ["Bluffing", "Set Collection", "Pocket Game"]
    },
    {
      name: "Unstable Unicorns",
      category: "Party",
      players: "2-8",
      duration: "30-45 min",
      image: "Assets/Images/Unstable Unicorns.webp",
      description: "Build an army of unicorns and betray your friends along the way.",
      tags: ["Take That", "Set Collection", "Humor"]
    },
    {
      name: "Braintopia",
      category: "Puzzle",
      players: "2-6",
      duration: "15 min",
      image: "Assets/Images/Braintopia.jpg",
      description: "Quick brain challenges of 8 different kinds, from memory to coordination.",
      tags: ["Brain Teaser", "Speed", "Variety"]
    },
    {
      name: "Deception: Murder in Hong Kong",
      category: "Deduction",
      players: "4-12",
      duration: "20-30 min",
      image: "Assets/Images/Deception.jpg",
      description: "Investigators try to solve a murder while the killer, sitting among them, tries to mislead them.",
      tags: ["Hidden Roles", "Deduction", "Social"]
    },
    {
      name: "Fog of Love",
      category: "Thematic",
      players: "2",
      duration: "60-120 min",
      image: "Assets/Images/Fog of Love.webp",
      description: "Two players act out a romantic comedy, and their choices decide how the relationship ends.",
      tags: ["Storytelling", "Roleplaying", "Negotiation"]
    },
    {
      name: "Dice Throne: Marvel",
      category: "Strategy",
      players: "2-6",
      duration: "30-45 min",
      image: "Assets/Images/Dice Throne Marvel.webp",
      description: "Pick a Marvel hero with their own dice and powers, and roll Yahtzee-style to fight.",
      tags: ["Dice Rolling", "Combat", "Marvel"]
    },
    {
      name: "Dice Throne: Santa vs Krampus",
      category: "Duel",
      players: "2",
      duration: "20-40 min",
      image: "Assets/Images/Dice Throne Santa vs Krampus.jpg",
      description: "A stand-alone Dice Throne duel: Santa against Krampus.",
      tags: ["Dice Rolling", "Combat", "Holiday-Themed"]
    },
    {
      name: "Sherlock Holmes: Consulting Detective",
      category: "Deduction",
      players: "1-8",
      duration: "60-120 min",
      image: "Assets/Images/Sherlock Holmes Consulting Detective.jpg",
      description: "Visit London locations and interview people to crack the case, then compare your answer with Holmes.",
      tags: ["Deduction", "Cooperative", "Story-Driven"]
    },
    {
      name: "Mysterium",
      category: "Cooperative",
      players: "2-7",
      duration: "45 min",
      image: "Assets/Images/Mysterium.jpg",
      description: "One player is a ghost who sends dreamlike picture clues so the others can solve the murder.",
      tags: ["Cooperative", "Deduction", "Visual Clues"]
    },
    {
      name: "Rhino Hero Super Battle",
      category: "Dexterity",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Rhino Hero Super Battle.jpg",
      description: "Build a wobbly skyscraper while superheroes climb it and battle each other.",
      tags: ["Dexterity", "Stacking", "Kids"]
    },
    {
      name: "Blood Rage",
      category: "Strategy",
      players: "2-4",
      duration: "60-90 min",
      image: "Assets/Images/Blood Rage.jpg",
      description: "Lead a Viking clan through Ragnarok, winning glory in battle before the world ends.",
      tags: ["Area Control", "Card Drafting", "Mythology"]
    },
    {
      name: "Mr. Jack",
      category: "Deduction",
      players: "2",
      duration: "30 min",
      image: "Assets/Images/Mr Jack.png",
      description: "A two-player duel in Victorian London. One plays Jack the Ripper, the other the detective chasing him.",
      tags: ["Hidden Movement", "Bluffing", "Asymmetric"]
    },
    {
      name: "Bureau of Investigations",
      category: "Deduction",
      players: "1-5",
      duration: "90-120 min",
      image: "Assets/Images/Bureau of Investigations.webp",
      description: "Investigate strange Lovecraftian cases in 1920s America.",
      tags: ["Deduction", "Storytelling", "Cthulhu Mythos"]
    },
    {
      name: "Dead Last",
      category: "Party",
      players: "6-12",
      duration: "30 min",
      image: "Assets/Images/Dead Last.jpeg",
      description: "Secretly team up to vote someone out, then betray your partners until one player is left.",
      tags: ["Social Deduction", "Voting", "Bluffing"]
    },
    {
      name: "In Vino Morte",
      category: "Bluffing",
      players: "3-12",
      duration: "10 min",
      image: "Assets/Images/In Vino Morte.png",
      description: "Pass out cups of wine, one of them poisoned, and try not to drink it.",
      tags: ["Bluffing", "Microgame", "Social"]
    },
    {
      name: "Exploding Kittens Recipes For Disaster",
      category: "Party",
      players: "2-5",
      duration: "15 min",
      image: "Assets/Images/Exploding Kittens Blue.webp",
      description: "More Exploding Kittens chaos, with new cards and combos.",
      tags: ["Expansion", "Humor", "Push Your Luck"]
    },
    {
      name: "Katamino Family",
      category: "Puzzle",
      players: "1-2",
      duration: "10-20 min",
      image: "Assets/Images/Katamino Family.webp",
      description: "Fit pentomino pieces into a space that gets harder to fill each round. Good for all ages.",
      tags: ["Tetris-Like", "Spatial", "Kids Friendly"]
    },
    {
      name: "Not Alone",
      category: "Bluffing",
      players: "2-7",
      duration: "30-45 min",
      image: "Assets/Images/Not Alone.png",
      description: "One player is an alien creature hunting the others, who are stranded on its planet.",
      tags: ["Asymmetric", "Bluffing", "Sci-Fi"]
    },
    {
      name: "Obrolan Hati Pacar",
      category: "Party",
      players: "2+",
      duration: "30+ min",
      image: "Assets/Images/Obrolan Hati.png",
      description: "A local card game of questions for couples, from deep to spicy.",
      tags: ["Conversation", "Local", "Relationship"]
    },
    {
      name: "Memoarr!",
      category: "Memory",
      players: "2-4",
      duration: "20 min",
      image: "Assets/Images/Memoarr.jpg",
      description: "Remember where the matching pictures are to escape a sinking island and avoid the traps.",
      tags: ["Memory", "Animal Theme", "Kids Friendly"]
    },
    {
      name: "House of Danger",
      category: "Adventure",
      players: "1-8",
      duration: "60-90 min",
      image: "Assets/Images/House of Danger.jpg",
      description: "A choose-your-own-adventure mystery in a haunted mansion.",
      tags: ["Storytelling", "Exploration", "Solo-Friendly"]
    },
    {
      name: "Agricola",
      category: "Strategy",
      players: "1-5",
      duration: "30-150 min",
      image: "Assets/Images/Agricola.webp",
      description: "Grow your farm and feed your family, one carefully planned action at a time.",
      tags: ["Worker Placement", "Resource Management", "Farming"]
    },
    {
      name: "Stupefy",
      category: "Party",
      players: "3-8",
      duration: "30 min",
      image: "Assets/Images/Stupefy.webp",
      description: "Cast spells to outwit the other wizards in a fast duel.",
      tags: ["Bluffing", "Party Game", "Magic-Themed"]
    },
    {
      name: "Cupcake Academy",
      category: "Family",
      players: "2-4",
      duration: "10-20 min",
      image: "Assets/Images/Cupcake Academy.webp",
      description: "Work together in real time to sort cupcake trays and finish the orders.",
      tags: ["Real-Time", "Cooperative", "Pattern Recognition"]
    },    
    {
      name: "Santai Aja Lagi",
      category: "Casual",
      players: "2-6",
      duration: "30 min",
      image: "Assets/Images/Santai Aja Lagi.jpeg",
      description: "A relaxed game about taking it easy and hanging out with friends.",
      tags: ["Relaxing", "Conversation", "Light Strategy"]
    },
    {
      name: "Sequence",
      category: "Family",
      players: "2-12",
      duration: "30 min",
      image: "Assets/Images/Sequence.avif",
      description: "Play a card and put a chip on the matching space. Get five in a row to win.",
      tags: ["Card Game", "Pattern Building", "Strategy"]
    },
    {
      name: "Go Go Gelato!",
      category: "Kids",
      players: "2-4",
      duration: "15 min",
      image: "Assets/Images/Go Go Gelato.png",
      description: "Race to rearrange ice cream scoops on your cones to match the challenge card.",
      tags: ["Dexterity", "Pattern Matching", "Real-Time"]
    },
    {
      name: "Duck Duck Go",
      category: "Family",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Duck Duck Go.png",
      description: "Race rubber ducks through a bathtub obstacle course.",
      tags: ["Programming", "Racing", "Family Friendly"]
    },
    {
      name: "Herd Mentality",
      category: "Party",
      players: "4-20",
      duration: "20 min",
      image: "Assets/Images/Herd Mentality.jpg",
      description: "Write the same answer as everyone else. Be the odd one out and you get stuck with the pink cow.",
      tags: ["Party Game", "Social", "Humor"]
    },
    {
      name: "Battle Sheep",
      category: "Abstract",
      players: "2-4",
      duration: "15-20 min",
      image: "Assets/Images/Battle Sheep.jpg",
      description: "Split your stack of sheep across the pasture and claim more ground than everyone else.",
      tags: ["Area Control", "Tile Placement", "Abstract"]
    },
    {
      name: "Little Red Riding Hood",
      category: "Storytelling",
      players: "1-4",
      duration: "20-30 min",
      image: "Assets/Images/Little Red Riding Hood.jpg",
      description: "Help Little Red through the forest to grandma's house in a co-op fairy tale game.",
      tags: ["Cooperative", "Story-Driven", "Family"]
    },
    {
      name: "Snow Time",
      category: "Strategy",
      players: "3-5",
      duration: "30-40 min",
      image: "Assets/Images/Snow Time.jpg",
      description: "Collect magical fruits in the snow and outwit the other players.",
      tags: ["Simultaneous Play", "Bluffing", "Area Control"]
    },
    {
      name: "Geometric Art",
      category: "Party",
      players: "3-6",
      duration: "30 min",
      image: "Assets/Images/Geometric Art.webp",
      description: "Draw geometric shapes as clues and get the others to guess what you mean.",
      tags: ["Drawing", "Deduction", "Creativity"]
    },
    {
      name: "Tortuga",
      category: "Social Deduction",
      players: "2-9",
      duration: "20-40 min",
      image: "Assets/Images/Tortuga.webp",
      description: "Pick a secret side and fight for the treasure aboard a pirate ship.",
      tags: ["Hidden Roles", "Voting", "Thematic"]
    },
    {
      name: "The Grizzled",
      category: "Cooperative",
      players: "2-5",
      duration: "30 min",
      image: "Assets/Images/The Grizzled.jpg",
      description: "A co-op card game about a group of friends trying to get through World War I together.",
      tags: ["Cooperative", "Hand Management", "War-Themed"]
    },
    {
      name: "Machi Koro",
      category: "City Building",
      players: "2-4",
      duration: "30 min",
      image: "Assets/Images/Machi Koro.webp",
      description: "Roll dice to earn money from your buildings, and grow your city faster than your rivals.",
      tags: ["Dice Rolling", "Engine Building", "Light Strategy"]
    },
    {
      name: "Chromino",
      category: "Abstract",
      players: "1-6",
      duration: "30 min",
      image: "Assets/Images/Chromino.jpg",
      description: "Domino-style tiles with three colors each. Place them so the colors line up.",
      tags: ["Tile Placement", "Color Matching", "Abstract"]
    },
    {
      name: "Spirit Island",
      category: "Cooperative",
      players: "1-4",
      duration: "90-120 min",
      image: "Assets/Images/Spirit Island.webp",
      description: "Play as spirits of the land and work together to drive the colonizers off your island.",
      tags: ["Cooperative", "Area Control", "Asymmetric Powers"]
    },
    {
      name: "IKI",
      category: "Strategy",
      players: "2-4",
      duration: "60-90 min",
      image: "Assets/Images/Iki.webp",
      description: "Live as a merchant in Edo-period Tokyo and become the city's most respected citizen.",
      tags: ["Resource Management", "Worker Placement", "Historical"]
    },
    {
      name: "Happy Little Dinosaurs",
      category: "Party",
      players: "2-4",
      duration: "30-60 min",
      image: "Assets/Images/Happy Little Dinosaurs.jpg",
      description: "Dodge one disaster after another and be the last dinosaur standing.",
      tags: ["Humor", "Take That", "Light Strategy"]
    },
    {
      name: "Mansions of Madness",
      category: "Horror",
      players: "1-5",
      duration: "120-180 min",
      image: "Assets/Images/Mansions of Madness.jpg",
      description: "An app-guided horror game. Explore haunted mansions, solve mysteries and fight Lovecraftian monsters.",
      tags: ["Cooperative", "App-Driven", "Exploration", "Horror"]
    },
    {
      name: "Cards Against Humanity",
      category: "Party",
      players: "4-20+",
      duration: "30-90 min",
      image: "Assets/Images/Cards Against Humanity.jpeg",
      description: "Fill in the blanks with the funniest (or worst) card you have. Adults only.",
      tags: ["Humor", "Adult", "Fill-in-the-Blank"]
    },
    {
      name: "Cash 'n Guns",
      category: "Party",
      players: "4-8",
      duration: "30 min",
      image: "Assets/Images/Cash n Guns.webp",
      description: "Point foam guns at each other and decide who's bluffing before the loot gets split.",
      tags: ["Bluffing", "Party Game", "Action Selection"]
    },
    {
      name: "Aquatica",
      category: "Strategy",
      players: "1-4",
      duration: "30-60 min",
      image: "Assets/Images/Aquatica.png",
      description: "Rule an underwater kingdom by recruiting characters and conquering locations.",
      tags: ["Engine Building", "Hand Management", "Underwater Theme"]
    },
    {
      name: "Telestrations",
      category: "Party",
      players: "4-8",
      duration: "30 min",
      image: "Assets/Images/Telestrations.webp",
      description: "Draw a word, guess the drawing, and watch the message go wrong as it moves around the table.",
      tags: ["Drawing", "Party Game", "Laugh-Out-Loud"]
    },
    {
      name: "Unconscious Mind",
      category: "Strategy",
      players: "1-4",
      duration: "90-120 min",
      image: "Assets/Images/Unconscious Mind.jpg",
      description: "Work as a psychoanalyst in Freud's Vienna, analyzing dreams in a heavy Euro game.",
      tags: ["Worker Placement", "Tableau Building", "Narrative"]
    },
    {
      name: "YAK",
      category: "Strategy",
      players: "2-4",
      duration: "45 min",
      image: "Assets/Images/YAK.webp",
      description: "Build stone towers and trade with yak caravans. Calm, but tactical. Designed by Michael Luu.",
      tags: ["Resource Management", "Tile Placement", "Visual Strategy"]
    },
    {
      name: "Mahjong",
      category: "Classic",
      players: "4",
      duration: "60-120 min",
      image: "Assets/Images/Mahjong.jpg",
      description: "The traditional Chinese tile game. Draw and discard tiles to build matching sets.",
      tags: ["Tile Game", "Pattern Recognition", "Classic"]
    },      
  ];

  // 1. Render all boardgames
  function renderBoardgames(filteredGames) {
    container.innerHTML = "";

    if (filteredGames.length === 0) {
      container.innerHTML = "<p>No games match that search.</p>";
      return;
    }

    filteredGames.forEach((game, i) => {
      const card = document.createElement("div");
      card.className = "boardgame-card fadeUp";
      card.style.setProperty("--i", Math.min(i, 11)); // stagger order for the entrance
      card.innerHTML = `
        <img src="${game.image}" alt="${game.name}" loading="lazy" decoding="async">
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
  // Collection.html gates its content behind a login check further below —
  // render a loading state there instead of flashing the full, ungrouped,
  // unauthenticated game list before the check resolves.
  // The index page renders its own 10-game sample below, so it's skipped here too.
  if (window.location.pathname.includes("Collection.html")) {
    container.innerHTML = `<div class="loading-state"><span class="spinner" aria-hidden="true"></span>Loading your boardgame collection…</div>`;
  } else if (!(window.location.pathname === "/" || window.location.pathname.includes("index.html"))) {
    renderBoardgames(boardgames);
  }

  // 4. Event listeners
  // Not on Collection.html: it wires its own grouped-view filter once the login
  // check passes, and these would re-render a flat list underneath it.
  if (!window.location.pathname.includes("Collection.html")) {
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  }
  
  // ================= Boardgame Page =================
  if (window.location.pathname === "/" || window.location.pathname.includes("index.html")) {
      // 12 fills every row at 1, 2, 3 and 4 columns (10 left an orphan card)
      const maxToShow = 12;
      const shuffled = [...boardgames].sort(() => 0.5 - Math.random());
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
              seeMoreBox.classList.remove("hidden");
            seeMoreBox.innerHTML = data.loggedIn
            ? `<a href="Collection.html" class="see-more-button">See all ${boardgames.length} games</a>`
            : `<p><a href="Login.html">Log in</a> or <a href="Signup.html">sign up</a> to see all ${boardgames.length} games.</p>`;
          })
          .catch(err => {
            console.error("Error checking session in Boardgame.js:", err);
            seeMoreBox.classList.remove("hidden");
            seeMoreBox.innerHTML = `<p><a href="Login.html">Log in</a> or <a href="Signup.html">sign up</a> to see all ${boardgames.length} games.</p>`;
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
            redirectWithMessage("Login.html", "login_required", "Collection.html");
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
              container.innerHTML = `<p style="text-align:center;">No games match that search.</p>`;
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
                <img src="${game.image}" alt="${game.name}" loading="lazy" decoding="async" />
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
              const matchKeyword =
                game.name.toLowerCase().includes(keyword) ||
                game.tags.some(tag => tag.toLowerCase().includes(keyword));
              const matchCategory = category === "" || game.category === category;
              return matchKeyword && matchCategory;
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
          redirectWithMessage("Login.html", "session_error", "Collection.html");
        });
      }
  });