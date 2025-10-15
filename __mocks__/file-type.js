// Manual mock for file-type ESM module
const mockFileTypeFromBuffer = jest.fn()

module.exports = {
  fileTypeFromBuffer: mockFileTypeFromBuffer,
  __mockFileTypeFromBuffer: mockFileTypeFromBuffer, // Expose for tests
}
