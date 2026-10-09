"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  banner: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    badge: "Open source",
    repo: "GitHub repo",
  },
  nav: { explorer: "Cameras", methodology: "Methodology", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Open Nshipyard · Toronto",
    title: "Every camera, ranked: the full post-mortem on Toronto's traffic cameras.",
    sub: "Ontario banned municipal speed cameras on November 14, 2025. This is the post-mortem the City never published: 520 speed-camera sites from July 2020 to November 2025 and 321 red-light intersections from 2007 to mid-2026, ranked by tickets issued and implied fine revenue.",
    cta1: "See the rankings",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "2,150,715", label: "speed-camera tickets issued, July 2020 to November 2025" },
    { value: "$161.3M-$268.8M", label: "modelled fine revenue from speed cameras: a range, not an exact figure" },
    { value: "1,304,807", label: "red-light tickets issued, 2007 to mid-2026" },
    { value: "$424.1M", label: "exact implied fine revenue from red-light cameras ($325 per ticket)" },
  ],
  explorer: {
    kicker: "The rankings",
    title: "Two cameras, two rankings, one map.",
    tabAse: "Speed cameras",
    tabRlc: "Red-light cameras",
    search: "Search a street…",
    showing: "Showing", of: "of", noResult: "No cameras match.",
    colRank: "#", colLocation: "Location", colWard: "Ward", colActive: "Active", colTickets: "Tickets", colRevenue: "Implied revenue",
    aseNote: "Speed-camera revenue is a modelled range ($75-$125 per ticket), because the City does not publish how fast each ticketed driver was going. The red-light fine is a flat $325, so its revenue is exact.",
    mapTitle: "Where the tickets came from",
    mapSub: "Circle size scales with tickets issued. 185 of 520 speed-camera sites and 301 of 321 red-light intersections could be mapped; retired sites are absent from the City's location files.",
    legendAse: "Speed camera", legendRlc: "Red-light camera",
    range: "range",
  },
  caveats: {
    title: "What this does not show",
    items: [
      "Charges issued are not fines collected. Penalties are reduced on appeal, and some go unpaid.",
      "Speed-camera revenue is a modelled range ($75-$125 per ticket), never an exact number. Red-light revenue is exact at $325 per ticket.",
      "November 2025 is a partial month for speed cameras: the provincial ban took effect November 14, 2025. Red-light data for 2026 covers January to June only.",
      "Only 185 of 520 speed-camera sites could be placed on the map. The rest are retired sites that no longer appear in the City's locations file, so they are ranked in the table but not drawn.",
      "Every figure is stamped with its data vintage below. This page was built October 9, 2026.",
    ],
  },
  methodology: {
    kicker: "Methodology",
    title: "How the numbers were built.",
    sources: "Sources",
    sourceList: [
      ["Automated Speed Enforcement (ASE) Charges", "Monthly ticket counts per site code, July 2020 onward.", "https://open.toronto.ca/dataset/automated-speed-enforcement-ase-charges/"],
      ["Automated Speed Enforcement Locations", "Current camera site points, used for the map.", "https://open.toronto.ca/dataset/automated-speed-enforcement-locations/"],
      ["Red Light Camera Annual Charges", "Annual ticket counts per intersection, 2007 onward.", "https://open.toronto.ca/dataset/red-light-camera-annual-charges/"],
      ["Red Light Cameras", "Intersection points, used for the map.", "https://open.toronto.ca/dataset/red-light-cameras/"],
    ],
    joins: "Joins and normalization",
    joinItems: [
      "Speed-camera charge rows share 520 unique site codes across 631 raw rows: when a camera rotated back to a site, the City reused the code with a new enforcement period. Rows sharing a code were summed into one site record, and the longest location label was kept.",
      "The locations file carries no site code (the field holds the literal text \"None\" on every row), so sites were joined to map points by normalized location name: lowercase, punctuation stripped, street-type words expanded (Ave to Avenue, St to Street, and so on). 185 of 520 sites matched; the rest are retired sites the locations file no longer lists.",
      "Red-light charges join to locations by code offset: location code = charge code + 3500. 301 of 321 intersections matched, which also cross-checks the two files against each other.",
      "Months marked \"-\" in the speed-camera file (no enforcement that month) contribute zero tickets, not missing data.",
    ],
    revenue: "The revenue models",
    revenueItems: [
      "Red-light: exact. The Ontario fine is a flat $325 per ticket ($260 set fine, $60 victim surcharge, $5 court costs), uniform province-wide. Implied revenue = tickets x $325.",
      "Speed-camera: modelled range. Fines vary with speed over the limit under Ontario Regulation 355/22, and ASE cameras sit in community safety zones where the Highway Traffic Act doubles the per-kilometre rate ($5 becomes $10 per km/h for 1-19 km/h over). The City does not publish the speed distribution, so each site's revenue is shown as charges x [$75, $125] per ticket.",
      "Calibration: published reporting put the Parkside Dr camera at 63,000 charges and $6.8M in fines (December 2024), an average of about $108 per ticket. That sits inside the $75-$125 range, which is why the range was chosen. This dataset's Parkside total through November 2025 is 70,243 charges, implying $5.27M-$8.78M.",
    ],
    leftout: "What was left out",
    leftoutItems: [
      "The 2026 red-light column covers January to June 2026 only; it is included as published and labelled partial.",
      "The locations file reflects camera sites as currently published; historical sites are not recoverable from it, which is why the map is a subset of the ranking.",
      "Nothing was invented: where a value could not be verified from the source files, it is absent and labelled, never estimated.",
    ],
    vintage: "Data vintage: speed cameras July 2020 to November 2025, red-light cameras 2007 to June 2026. Downloaded and built October 9, 2026.",
  },
  developers: {
    kicker: "Developers",
    title: "Take the data with you.",
    body: "Every record behind this page is available as JSON and CSV, plus a REST API, an OpenAPI 3.1 document, and an MCP server for AI agents. MIT licensed.",
    apiTitle: "REST API",
    endpoints: [
      ["GET /api/v1/summary", "Citywide aggregates, top 25 lists, anchors, and methodology notes."],
      ["GET /api/v1/ase/sites?q=&limit=", "Search speed-camera sites by street name, ranked by tickets."],
      ["GET /api/v1/ase/site?code=A207", "One speed-camera site: full record plus the monthly series."],
      ["GET /api/v1/redlight/intersections?q=&limit=", "Search red-light intersections by name, ranked by tickets."],
      ["GET /api/v1/redlight/intersection?code=2578", "One intersection: full record plus the annual series."],
      ["GET /api/openapi.json", "The OpenAPI 3.1 document for this API."],
      ["POST /mcp", "MCP server (JSON-RPC 2.0): camera_site_search, camera_site_lookup, intersection_search, intersection_lookup, postmortem_summary."],
    ],
    tryIt: "Try it",
  },
  data: {
    kicker: "Data",
    title: "Download the underlying data.",
    body: "The same normalized files this page is built from, so journalists and researchers can check every number.",
    files: [
      ["ase_sites.csv", "520 speed-camera sites: tickets, modelled revenue range, enforcement periods, coordinates where available."],
      ["redlight.csv", "321 red-light intersections: tickets, exact implied revenue, enforcement periods, coordinates."],
      ["summary.json", "Citywide aggregates, top-25 lists, anchors, sources, and methodology notes."],
    ],
    download: "Download",
  },
  footer: {
    line: "The Camera Post-Mortem is an open-source civic data project. Data: City of Toronto Open Data Portal. Not affiliated with the Government of Canada or the City of Toronto.",
    sources: "Sources: ASE Charges, ASE Locations, Red Light Camera Annual Charges, Red Light Cameras.",
    built: "Built by",
  },
};

const fr: typeof en = {
  banner: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    badge: "Code source ouvert",
    repo: "Dépôt GitHub",
  },
  nav: { explorer: "Caméras", methodology: "Méthodologie", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Open Nshipyard · Toronto",
    title: "Chaque caméra, classée : le bilan complet des caméras de circulation de Toronto.",
    sub: "L'Ontario a interdit les radars photo municipaux le 14 novembre 2025. Voici le bilan que la Ville n'a jamais publié : 520 sites de radars photo de juillet 2020 à novembre 2025 et 321 intersections à feux rouges de 2007 à mi-2026, classés par contraventions émises et amendes estimées.",
    cta1: "Voir les classements",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "2 150 715", label: "contraventions de radars photo émises, de juillet 2020 à novembre 2025" },
    { value: "161,3 M$-268,8 M$", label: "amendes modélisées des radars photo : une fourchette, pas un chiffre exact" },
    { value: "1 304 807", label: "contraventions pour feux rouges émises, de 2007 à mi-2026" },
    { value: "424,1 M$", label: "amendes estimées exactes des caméras aux feux rouges (325 $ par contravention)" },
  ],
  explorer: {
    kicker: "Les classements",
    title: "Deux caméras, deux classements, une carte.",
    tabAse: "Radars photo",
    tabRlc: "Feux rouges",
    search: "Rechercher une rue…",
    showing: "Affichage de", of: "sur", noResult: "Aucune caméra ne correspond.",
    colRank: "#", colLocation: "Emplacement", colWard: "Quartier", colActive: "Actif", colTickets: "Contraventions", colRevenue: "Amendes estimées",
    aseNote: "Les recettes des radars photo sont une fourchette modélisée (75 $-125 $ par contravention), car la Ville ne publie pas la vitesse de chaque conducteur verbalisé. L'amende pour feu rouge est fixe à 325 $, donc son total est exact.",
    mapTitle: "D'où venaient les contraventions",
    mapSub: "La taille des cercles varie selon les contraventions émises. 185 des 520 sites de radars photo et 301 des 321 intersections à feux rouges ont pu être cartographiés; les sites retirés sont absents des fichiers de localisation de la Ville.",
    legendAse: "Radar photo", legendRlc: "Caméra feu rouge",
    range: "fourchette",
  },
  caveats: {
    title: "Ce que ceci ne montre pas",
    items: [
      "Les contraventions émises ne sont pas des amendes encaissées. Les pénalités sont réduites en appel et certaines restent impayées.",
      "Les recettes des radars photo sont une fourchette modélisée (75 $-125 $ par contravention), jamais un chiffre exact. Celles des feux rouges sont exactes à 325 $ par contravention.",
      "Novembre 2025 est un mois partiel pour les radars photo : l'interdiction provinciale est entrée en vigueur le 14 novembre 2025. Les données 2026 des feux rouges couvrent seulement janvier à juin.",
      "Seuls 185 des 520 sites de radars photo ont pu être placés sur la carte. Les autres sont des sites retirés qui ne figurent plus dans le fichier de localisation de la Ville : ils sont classés dans le tableau mais non dessinés.",
      "Chaque chiffre porte sa date de validité ci-dessous. Cette page a été construite le 9 octobre 2026.",
    ],
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Comment les chiffres ont été construits.",
    sources: "Sources",
    sourceList: [
      ["Contraventions des radars photo (ASE)", "Contraventions mensuelles par code de site, depuis juillet 2020.", "https://open.toronto.ca/dataset/automated-speed-enforcement-ase-charges/"],
      ["Emplacements des radars photo (ASE)", "Points des sites actuels, utilisés pour la carte.", "https://open.toronto.ca/dataset/automated-speed-enforcement-locations/"],
      ["Contraventions annuelles des caméras aux feux rouges", "Contraventions annuelles par intersection, depuis 2007.", "https://open.toronto.ca/dataset/red-light-camera-annual-charges/"],
      ["Caméras aux feux rouges", "Points des intersections, utilisés pour la carte.", "https://open.toronto.ca/dataset/red-light-cameras/"],
    ],
    joins: "Jointures et normalisation",
    joinItems: [
      "Les lignes de contraventions partagent 520 codes de site uniques sur 631 lignes brutes : quand une caméra revenait sur un site, la Ville réutilisait le code avec une nouvelle période d'application. Les lignes partageant un code ont été additionnées en un seul enregistrement, en conservant le libellé le plus long.",
      "Le fichier de localisation ne contient aucun code de site (le champ porte littéralement « None » sur chaque ligne); les sites ont donc été joints aux points cartographiques par nom d'emplacement normalisé : minuscules, ponctuation retirée, types de rue étendus (Ave vers Avenue, St vers Street, etc.). 185 des 520 sites ont été appariés; les autres sont des sites retirés que le fichier ne liste plus.",
      "Les contraventions pour feux rouges se joignent aux emplacements par décalage de code : code d'emplacement = code de contravention + 3500. 301 des 321 intersections ont été appariées, ce qui valide aussi les deux fichiers l'un contre l'autre.",
      "Les mois marqués « - » dans le fichier des radars photo (aucune application ce mois-là) comptent pour zéro contravention, pas pour une donnée manquante.",
    ],
    revenue: "Les modèles de recettes",
    revenueItems: [
      "Feux rouges : exact. L'amende ontarienne est fixe à 325 $ par contravention (260 $ d'amende, 60 $ de suramende, 5 $ de frais de justice), uniforme dans toute la province. Recette estimée = contraventions x 325 $.",
      "Radars photo : fourchette modélisée. Les amendes varient selon la vitesse au-delà de la limite en vertu du Règlement de l'Ontario 355/22, et les radars se trouvent dans des zones de sécurité communautaire où le Code de la route double le taux par kilomètre (5 $ devient 10 $ par km/h pour 1 à 19 km/h au-delà). La Ville ne publie pas la distribution des vitesses, donc chaque site est présenté comme contraventions x [75 $, 125 $] par contravention.",
      "Étalonnage : la presse rapportait 63 000 contraventions et 6,8 M$ d'amendes pour la caméra de Parkside Dr (décembre 2024), soit environ 108 $ par contravention. Ce chiffre se situe dans la fourchette 75 $-125 $, ce qui justifie son choix. Le total de Parkside dans ce jeu de données jusqu'en novembre 2025 est de 70 243 contraventions, soit 5,27 M$-8,78 M$ estimés.",
    ],
    leftout: "Ce qui a été exclu",
    leftoutItems: [
      "La colonne 2026 des feux rouges couvre seulement janvier à juin 2026; elle est incluse telle que publiée et marquée partielle.",
      "Le fichier de localisation reflète les sites publiés actuellement; les sites historiques n'y sont pas récupérables, ce qui explique que la carte soit un sous-ensemble du classement.",
      "Rien n'a été inventé : quand une valeur ne pouvait être vérifiée à partir des fichiers sources, elle est absente et signalée, jamais estimée.",
    ],
    vintage: "Validité des données : radars photo de juillet 2020 à novembre 2025, caméras aux feux rouges de 2007 à juin 2026. Téléchargées et construites le 9 octobre 2026.",
  },
  developers: {
    kicker: "Développeurs",
    title: "Emportez les données.",
    body: "Chaque enregistrement de cette page est disponible en JSON et CSV, avec une API REST, un document OpenAPI 3.1 et un serveur MCP pour les agents IA. Licence MIT.",
    apiTitle: "API REST",
    endpoints: [
      ["GET /api/v1/summary", "Agrégats municipaux, listes des 25 premiers, points de repère et notes méthodologiques."],
      ["GET /api/v1/ase/sites?q=&limit=", "Rechercher des sites de radars photo par nom de rue, classés par contraventions."],
      ["GET /api/v1/ase/site?code=A207", "Un site de radar photo : fiche complète plus la série mensuelle."],
      ["GET /api/v1/redlight/intersections?q=&limit=", "Rechercher des intersections à feux rouges par nom, classées par contraventions."],
      ["GET /api/v1/redlight/intersection?code=2578", "Une intersection : fiche complète plus la série annuelle."],
      ["GET /api/openapi.json", "Le document OpenAPI 3.1 de cette API."],
      ["POST /mcp", "Serveur MCP (JSON-RPC 2.0) : camera_site_search, camera_site_lookup, intersection_search, intersection_lookup, postmortem_summary."],
    ],
    tryIt: "Essayer",
  },
  data: {
    kicker: "Données",
    title: "Télécharger les données sous-jacentes.",
    body: "Les mêmes fichiers normalisés qui construisent cette page, pour que journalistes et chercheurs puissent vérifier chaque chiffre.",
    files: [
      ["ase_sites.csv", "520 sites de radars photo : contraventions, fourchette d'amendes modélisée, périodes d'application, coordonnées quand disponibles."],
      ["redlight.csv", "321 intersections à feux rouges : contraventions, amendes exactes estimées, périodes d'application, coordonnées."],
      ["summary.json", "Agrégats municipaux, listes des 25 premiers, points de repère, sources et notes méthodologiques."],
    ],
    download: "Télécharger",
  },
  footer: {
    line: "The Camera Post-Mortem est un projet civique de données à code source ouvert. Données : portail de données ouvertes de la Ville de Toronto. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    sources: "Sources : contraventions ASE, emplacements ASE, contraventions annuelles des feux rouges, caméras aux feux rouges.",
    built: "Construit par",
  },
};

const strings = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: typeof en }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: strings[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
