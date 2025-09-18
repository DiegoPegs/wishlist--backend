// Tipos compartilhados para JWT
export type JwtPayload = {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
};

// Tipo para o payload usado na criação do token
export type JwtCreatePayload = {
  sub: string;
  username: string;
  email: string;
};
