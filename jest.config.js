// jest.config.js
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  // ¡Elimina extensionsToTreatAsEsm!
};
