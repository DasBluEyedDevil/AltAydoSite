export interface Ship {
  name: string;
  image: string;
}

export interface ShipManufacturer {
  name: string;
  ships: Ship[];
}

// Create a function to format the image name from the ship name
export const formatShipImageName = (shipName: string): string => {
  return shipName.toLowerCase().replace(/\s+/g, '_').replace(/[\.']/g, '').replace(/\//g, '_') + '.png';
};

// Ship data organized by manufacturer
export const shipManufacturers: ShipManufacturer[] = [
  {
    name: "Aegis Dynamics",
    ships: [
      { name: "Avenger Stalker", image: formatShipImageName("Avenger Stalker") },
      { name: "Avenger Titan", image: formatShipImageName("Avenger Titan") },
      { name: "Avenger Titan Renegade", image: formatShipImageName("Avenger Titan Renegade") },
      { name: "Avenger Warlock", image: formatShipImageName("Avenger Warlock") },
      { name: "Eclipse", image: formatShipImageName("Eclipse") },
      { name: "Gladius", image: formatShipImageName("Gladius") },
      { name: "Gladius Pirate", image: formatShipImageName("Gladius Pirate") },
      { name: "Gladius Valiant", image: formatShipImageName("Gladius Valiant") },
      { name: "Hammerhead", image: formatShipImageName("Hammerhead") },
      { name: "Hammerhead Best In Show Edition", image: formatShipImageName("Hammerhead Best In Show Edition") },
      { name: "Idris-K", image: formatShipImageName("Idris-K") },
      { name: "Idris-M", image: formatShipImageName("Idris-M") },
      { name: "Idris-P", image: formatShipImageName("Idris-P") },
      { name: "Javelin", image: formatShipImageName("Javelin") },
      { name: "Nautilus", image: formatShipImageName("Nautilus") },
      { name: "Reclaimer", image: formatShipImageName("Reclaimer") },
      { name: "Reclaimer Best In Show Edition", image: formatShipImageName("Reclaimer Best In Show Edition") },
      { name: "Redeemer", image: formatShipImageName("Redeemer") },
      { name: "Retaliator", image: formatShipImageName("Retaliator") },
      { name: "Sabre", image: formatShipImageName("Sabre") },
      { name: "Sabre Comet", image: formatShipImageName("Sabre Comet") },
      { name: "Sabre Firebird", image: formatShipImageName("Sabre Firebird") },
      { name: "Sabre Peregrine", image: formatShipImageName("Sabre Peregrine") },
      { name: "Sabre Raven", image: formatShipImageName("Sabre Raven") },
      { name: "Vanguard Harbinger", image: formatShipImageName("Vanguard Harbinger") },
      { name: "Vanguard Hoplite", image: formatShipImageName("Vanguard Hoplite") },
      { name: "Vanguard Sentinel", image: formatShipImageName("Vanguard Sentinel") },
      { name: "Vanguard Warden", image: formatShipImageName("Vanguard Warden") },
      { name: "Vulcan", image: formatShipImageName("Vulcan") }
    ]
  },
  {
    name: "Anvil Aerospace",
    ships: [
      { name: "Arrow", image: formatShipImageName("Arrow") },
      { name: "Ballista", image: formatShipImageName("Ballista") },
      { name: "Ballista Dunestalker", image: formatShipImageName("Ballista Dunestalker") },
      { name: "Ballista Snowblind", image: formatShipImageName("Ballista Snowblind") },
      { name: "C8R Pisces Rescue", image: formatShipImageName("C8R Pisces Rescue") },
      { name: "C8X Pisces Expedition", image: formatShipImageName("C8X Pisces Expedition") },
      { name: "Carrack", image: formatShipImageName("Carrack") },
      { name: "Carrack Expedition", image: formatShipImageName("Carrack Expedition") },
      { name: "Centurion", image: formatShipImageName("Centurion") },
      { name: "Crucible", image: formatShipImageName("Crucible") },
      { name: "F7C Hornet Mk I", image: formatShipImageName("F7C Hornet Mk I") },
      { name: "F7C Hornet Mk II", image: formatShipImageName("F7C Hornet Mk II") },
      { name: "F7C Hornet Wildfire Mk I", image: formatShipImageName("F7C Hornet Wildfire Mk I") },
      { name: "F7C-M Hornet Heartseeker Mk II", image: formatShipImageName("F7C-M Hornet Heartseeker Mk II") },
      { name: "F7C-M Super Hornet Heartseeker Mk I", image: formatShipImageName("F7C-M Super Hornet Heartseeker Mk I") },
      { name: "F7C-M Super Hornet Mk I", image: formatShipImageName("F7C-M Super Hornet Mk I") },
      { name: "F7C M Super Hornet Mk II", image: formatShipImageName("F7C M Super Hornet Mk II") },
      { name: "F7C-R Hornet Tracker Mk I", image: formatShipImageName("F7C-R Hornet Tracker Mk I") },
      { name: "F7C-R Hornet Tracker Mk II", image: formatShipImageName("F7C-R Hornet Tracker Mk II") },
      { name: "F7C-S Hornet Ghost Mk I", image: formatShipImageName("F7C-S Hornet Ghost Mk I") },
      { name: "F7C-S Hornet Ghost Mk II", image: formatShipImageName("F7C-S Hornet Ghost Mk II") },
      { name: "F8C Lightening", image: formatShipImageName("F8C Lightening") },
      { name: "Gladiator", image: formatShipImageName("Gladiator") },
      { name: "Hawk", image: formatShipImageName("Hawk") },
      { name: "Hurricane", image: formatShipImageName("Hurricane") },
      { name: "Legionnaire", image: formatShipImageName("Legionnaire") },
      { name: "Liberator", image: formatShipImageName("Liberator") },
      { name: "Paladin", image: formatShipImageName("Paladin") },
      { name: "Spartan", image: formatShipImageName("Spartan") },
      { name: "Terrapin", image: formatShipImageName("Terrapin") },
      { name: "Terrapin Medic", image: formatShipImageName("Terrapin Medic") },
      { name: "Valkyrie", image: formatShipImageName("Valkyrie") },
      { name: "Valkyrie Liberator", image: formatShipImageName("Valkyrie Liberator") }
    ]
  },
  {
    name: "Aopoa",
    ships: [
      { name: "Blade", image: formatShipImageName("Blade") },
      { name: "Khartu-al", image: formatShipImageName("Khartu-al") },
      { name: "Nox", image: formatShipImageName("Nox") },
      { name: "Nox Kue", image: formatShipImageName("Nox Kue") },
      { name: "San'tok.yāi", image: formatShipImageName("San'tok.yāi") },
      { name: "Scythe", image: formatShipImageName("Scythe") }
    ]
  },
  {
    name: "Argo Astronautics",
    ships: [
      { name: "ATLS", image: formatShipImageName("ATLS") },
      { name: "ATLS GEO", image: formatShipImageName("ATLS GEO") },
      { name: "CSV-SM", image: formatShipImageName("CSV-SM") },
      { name: "MPUV Cargo", image: formatShipImageName("MPUV Cargo") },
      { name: "MPUV Personnel", image: formatShipImageName("MPUV Personnel") },
      { name: "MPUV Tractor", image: formatShipImageName("MPUV Tractor") },
      { name: "MOLE", image: formatShipImageName("MOLE") },
      { name: "MOLE Carbon", image: formatShipImageName("MOLE Carbon") },
      { name: "MOLE Talus", image: formatShipImageName("MOLE Talus") },
      { name: "RAFT", image: formatShipImageName("RAFT") },
      { name: "SRV", image: formatShipImageName("SRV") }
    ]
  },
  {
    name: "Banu",
    ships: [
      { name: "Defender", image: formatShipImageName("Defender") },
      { name: "Merchantman", image: formatShipImageName("Merchantman") }
    ]
  },
  {
    name: "CNOU (Consolidated Outland)",
    ships: [
      { name: "HoverQuad", image: formatShipImageName("HoverQuad") },
      { name: "Nomad", image: formatShipImageName("Nomad") },
      { name: "Pioneer", image: formatShipImageName("Pioneer") },
      { name: "Mustang Alpha", image: formatShipImageName("Mustang Alpha") },
      { name: "Mustang Alpha Vindicator", image: formatShipImageName("Mustang Alpha Vindicator") },
      { name: "Mustang Beta", image: formatShipImageName("Mustang Beta") },
      { name: "Mustang Delta", image: formatShipImageName("Mustang Delta") },
      { name: "Mustang Gamma", image: formatShipImageName("Mustang Gamma") },
      { name: "Mustang Omega", image: formatShipImageName("Mustang Omega") }
    ]
  },
  {
    name: "Crusader Industries",
    ships: [
      { name: "A1 Spirit", image: formatShipImageName("A1 Spirit") },
      { name: "A2 Hercules Starlifter", image: formatShipImageName("A2 Hercules Starlifter") },
      { name: "Ares Star Fighter Inferno", image: formatShipImageName("Ares Star Fighter Inferno") },
      { name: "Ares Star Fighter Ion", image: formatShipImageName("Ares Star Fighter Ion") },
      { name: "C1 Spirit", image: formatShipImageName("C1 Spirit") },
      { name: "C2 Hercules Starlifter", image: formatShipImageName("C2 Hercules Starlifter") },
      { name: "E1 Spirit", image: formatShipImageName("E1 Spirit") },
      { name: "Genesis Starliner", image: formatShipImageName("Genesis Starliner") },
      { name: "Intrepid", image: formatShipImageName("Intrepid") },
      { name: "M2 Hercules Starlifter", image: formatShipImageName("M2 Hercules Starlifter") },
      { name: "Mercury Star Runner", image: formatShipImageName("Mercury Star Runner") }
    ]
  },
  {
    name: "Drake Interplanetary",
    ships: [
      { name: "Buccaneer", image: formatShipImageName("Buccaneer") },
      { name: "Caterpillar", image: formatShipImageName("Caterpillar") },
      { name: "Caterpillar Best In Show Edition", image: formatShipImageName("Caterpillar Best In Show Edition") },
      { name: "Caterpillar Pirate Edition", image: formatShipImageName("Caterpillar Pirate Edition") },
      { name: "Corsair", image: formatShipImageName("Corsair") },
      { name: "Cutlass Black", image: formatShipImageName("Cutlass Black") },
      { name: "Cutlass Black Best In Show Edition", image: formatShipImageName("Cutlass Black Best In Show Edition") },
      { name: "Cutlass Blue", image: formatShipImageName("Cutlass Blue") },
      { name: "Cutlass Red", image: formatShipImageName("Cutlass Red") },
      { name: "Cutlass Steel", image: formatShipImageName("Cutlass Steel") },
      { name: "Cutter", image: formatShipImageName("Cutter") },
      { name: "Cutter Rambler", image: formatShipImageName("Cutter Rambler") },
      { name: "Cutter Scout", image: formatShipImageName("Cutter Scout") },
      { name: "Dragonfly", image: formatShipImageName("Dragonfly") },
      { name: "Dragonfly Yellowjacket", image: formatShipImageName("Dragonfly Yellowjacket") },
      { name: "Golem", image: formatShipImageName("Golem") },
      { name: "Herald", image: formatShipImageName("Herald") },
      { name: "Ironclad", image: formatShipImageName("Ironclad") },
      { name: "Ironclad Assault", image: formatShipImageName("Ironclad Assault") },
      { name: "Kraken", image: formatShipImageName("Kraken") },
      { name: "Kraken Privateer", image: formatShipImageName("Kraken Privateer") },
      { name: "Mule", image: formatShipImageName("Mule") },
      { name: "Vulture", image: formatShipImageName("Vulture") }
    ]
  },
  {
    name: "Esperia",
    ships: [
      { name: "Glaive", image: formatShipImageName("Glaive") },
      { name: "Prowler", image: formatShipImageName("Prowler") },
      { name: "Talon", image: formatShipImageName("Talon") },
      { name: "Talon Shrike", image: formatShipImageName("Talon Shrike") }
    ]
  },
  {
    name: "Gatac Manufacture",
    ships: [
      { name: "Railen", image: formatShipImageName("Railen") },
      { name: "Syulen", image: formatShipImageName("Syulen") }
    ]
  },
  {
    name: "Greycat Industrial",
    ships: [
      { name: "MTC", image: formatShipImageName("MTC") },
      { name: "PTV", image: formatShipImageName("PTV") },
      { name: "ROC", image: formatShipImageName("ROC") },
      { name: "ROC-DS", image: formatShipImageName("ROC-DS") },
      { name: "STV", image: formatShipImageName("STV") },
      { name: "Ursa", image: formatShipImageName("Ursa") },
      { name: "Ursa Fortuna", image: formatShipImageName("Ursa Fortuna") },
      { name: "Ursa Medivac", image: formatShipImageName("Ursa Medivac") }
    ]
  },
  {
    name: "Kruger Intergalatic",
    ships: [
      { name: "P-52 Merlin", image: formatShipImageName("P-52 Merlin") },
      { name: "P-72 Archimedes", image: formatShipImageName("P-72 Archimedes") },
      { name: "P-72 Archimedes Emerald", image: formatShipImageName("P-72 Archimedes Emerald") }
    ]
  },
  {
    name: "MISC (Musashi Industrial and Starflight Concern)",
    ships: [
      { name: "Endeavor", image: formatShipImageName("Endeavor") },
      { name: "Expanse", image: formatShipImageName("Expanse") },
      { name: "Fortune", image: formatShipImageName("Fortune") },
      { name: "Freelancer", image: formatShipImageName("Freelancer") },
      { name: "Freelancer DUR", image: formatShipImageName("Freelancer DUR") },
      { name: "Freelancer MAX", image: formatShipImageName("Freelancer MAX") },
      { name: "Freelancer MIS", image: formatShipImageName("Freelancer MIS") },
      { name: "Hull A", image: formatShipImageName("Hull A") },
      { name: "Hull B", image: formatShipImageName("Hull B") },
      { name: "Hull C", image: formatShipImageName("Hull C") },
      { name: "Hull D", image: formatShipImageName("Hull D") },
      { name: "Hull E", image: formatShipImageName("Hull E") },
      { name: "Odyssey", image: formatShipImageName("Odyssey") },
      { name: "Prospector", image: formatShipImageName("Prospector") },
      { name: "Razor", image: formatShipImageName("Razor") },
      { name: "Razor EX", image: formatShipImageName("Razor EX") },
      { name: "Razor LX", image: formatShipImageName("Razor LX") },
      { name: "Reliant Kore", image: formatShipImageName("Reliant Kore") },
      { name: "Reliant Mako", image: formatShipImageName("Reliant Mako") },
      { name: "Reliant Sen", image: formatShipImageName("Reliant Sen") },
      { name: "Reliant Tana", image: formatShipImageName("Reliant Tana") },
      { name: "Starfarer", image: formatShipImageName("Starfarer") },
      { name: "Starfarer Gemini", image: formatShipImageName("Starfarer Gemini") },
      { name: "Starlancer MAX", image: formatShipImageName("Starlancer MAX") },
      { name: "Starlancer TAC", image: formatShipImageName("Starlancer TAC") }
    ]
  },
  {
    name: "Mirai",
    ships: [
      { name: "Fury", image: formatShipImageName("Fury") },
      { name: "Fury LX", image: formatShipImageName("Fury LX") },
      { name: "Fury MX", image: formatShipImageName("Fury MX") },
      { name: "G12", image: formatShipImageName("G12") },
      { name: "G12a", image: formatShipImageName("G12a") },
      { name: "G12r", image: formatShipImageName("G12r") },
      { name: "Guardian", image: formatShipImageName("Guardian") },
      { name: "Guardian MX", image: formatShipImageName("Guardian MX") },
      { name: "Guardian QI", image: formatShipImageName("Guardian QI") },
      { name: "Pulse", image: formatShipImageName("Pulse") },
      { name: "Pulse LX", image: formatShipImageName("Pulse LX") }
    ]
  },
  {
    name: "Origin Jumpworks",
    ships: [
      { name: "100i", image: formatShipImageName("100i") },
      { name: "125a", image: formatShipImageName("125a") },
      { name: "135c", image: formatShipImageName("135c") },
      { name: "300i", image: formatShipImageName("300i") },
      { name: "315p", image: formatShipImageName("315p") },
      { name: "325a", image: formatShipImageName("325a") },
      { name: "350r", image: formatShipImageName("350r") },
      { name: "400i", image: formatShipImageName("400i") },
      { name: "600i Executive Edition", image: formatShipImageName("600i Executive Edition") },
      { name: "600i Explorer", image: formatShipImageName("600i Explorer") },
      { name: "600i Touring", image: formatShipImageName("600i Touring") },
      { name: "85x", image: formatShipImageName("85x") },
      { name: "890 Jump", image: formatShipImageName("890 Jump") },
      { name: "M50", image: formatShipImageName("M50") },
      { name: "X1", image: formatShipImageName("X1") },
      { name: "X1 Force", image: formatShipImageName("X1 Force") },
      { name: "X1 Velocity", image: formatShipImageName("X1 Velocity") }
    ]
  },
  {
    name: "Roberts Space Industries (RSI)",
    ships: [
      { name: "Apollo Medivac", image: formatShipImageName("Apollo Medivac") },
      { name: "Apollo Triage", image: formatShipImageName("Apollo Triage") },
      { name: "Arrastra", image: formatShipImageName("Arrastra") },
      { name: "Aurora CL", image: formatShipImageName("Aurora CL") },
      { name: "Aurora ES", image: formatShipImageName("Aurora ES") },
      { name: "Aurora LN", image: formatShipImageName("Aurora LN") },
      { name: "Aurora LX", image: formatShipImageName("Aurora LX") },
      { name: "Aurora MR", image: formatShipImageName("Aurora MR") },
      { name: "Constellation Andromeda", image: formatShipImageName("Constellation Andromeda") },
      { name: "Constellation Aquila", image: formatShipImageName("Constellation Aquila") },
      { name: "Constellation Phoenix", image: formatShipImageName("Constellation Phoenix") },
      { name: "Constellation Phoenix Emerald", image: formatShipImageName("Constellation Phoenix Emerald") },
      { name: "Constellation Taurus", image: formatShipImageName("Constellation Taurus") },
      { name: "Galaxy", image: formatShipImageName("Galaxy") },
      { name: "Lynx", image: formatShipImageName("Lynx") },
      { name: "Mantis", image: formatShipImageName("Mantis") },
      { name: "Orion", image: formatShipImageName("Orion") },
      { name: "Perseus", image: formatShipImageName("Perseus") },
      { name: "Polaris", image: formatShipImageName("Polaris") },
      { name: "Scorpius", image: formatShipImageName("Scorpius") },
      { name: "Scorpius Antares", image: formatShipImageName("Scorpius Antares") },
      { name: "Zeus Mk II CL", image: formatShipImageName("Zeus Mk II CL") },
      { name: "Zeus Mk II ES", image: formatShipImageName("Zeus Mk II ES") },
      { name: "Zeus Mk II MR", image: formatShipImageName("Zeus Mk II MR") }
    ]
  },
  {
    name: "Tumbril Land Systems",
    ships: [
      { name: "Cyclone", image: formatShipImageName("Cyclone") },
      { name: "Cyclone AA", image: formatShipImageName("Cyclone AA") },
      { name: "Cyclone MT", image: formatShipImageName("Cyclone MT") },
      { name: "Cyclone RC", image: formatShipImageName("Cyclone RC") },
      { name: "Cyclone RN", image: formatShipImageName("Cyclone RN") },
      { name: "Cyclone TR", image: formatShipImageName("Cyclone TR") },
      { name: "Nova", image: formatShipImageName("Nova") },
      { name: "Storm", image: formatShipImageName("Storm") },
      { name: "Storm AA", image: formatShipImageName("Storm AA") }
    ]
  },
  {
    name: "Vanduul",
    ships: [
      { name: "Scythe", image: formatShipImageName("Scythe") }
    ]
  }
];

// Get the list of all manufacturers for the dropdown
export const getManufacturersList = (): string[] => {
  return shipManufacturers.map(manufacturer => manufacturer.name);
};

// Get ships for a specific manufacturer
export const getShipsByManufacturer = (manufacturerName: string): Ship[] => {
  const manufacturer = shipManufacturers.find(m => m.name === manufacturerName);
  return manufacturer ? manufacturer.ships : [];
}; 