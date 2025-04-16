/* eslint-disable */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true }], // Mengonfigurasi ts-jest langsung di sini
  },
  moduleFileExtensions: ['ts', 'js'],
  testPathIgnorePatterns: ['/node_modules/'],
};
