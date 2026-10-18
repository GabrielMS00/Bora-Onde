// Lista fixa de cidades (seletor de Cidade nos cadastros e no perfil). Formato "Cidade, UF".
// Campinas concentra o seed; as outras permitem demonstrar a troca de cidade no perfil.
export const CITIES = ['Campinas, SP', 'São Paulo, SP', 'Belo Horizonte, MG'] as const;

export type City = (typeof CITIES)[number];
