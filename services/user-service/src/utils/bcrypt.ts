import bcrypt from 'bcryptjs';

const saltRounds = 10;

const encrypt = (password: string): string => {
  return bcrypt.hashSync(password, saltRounds);
};

const compare = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

export { encrypt, compare };
