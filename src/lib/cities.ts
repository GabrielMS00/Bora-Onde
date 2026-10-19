// Lista fixa de cidades (seletor de Cidade nos cadastros e no perfil). Formato "Cidade, UF".
// Brasília concentra o seed; as outras permitem demonstrar a troca de cidade no perfil.
export const CITIES = ['Brasília, DF', 'São Paulo, SP', 'Belo Horizonte, MG'] as const;

export type City = (typeof CITIES)[number];
