import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// The legacy APK needs one ARM32 ELF entry so Android 7 selects the 32-bit
// zygote before loading a 32-bit-only System WebView. The library is not loaded.
const elf = Buffer.alloc(84);
elf.set([0x7f, 0x45, 0x4c, 0x46, 1, 1, 1, 0], 0);
elf.writeUInt16LE(3, 16); // ET_DYN
elf.writeUInt16LE(40, 18); // EM_ARM
elf.writeUInt32LE(1, 20);
elf.writeUInt32LE(52, 28);
elf.writeUInt32LE(0x05000000, 36); // ARM EABI5
elf.writeUInt16LE(52, 40);
elf.writeUInt16LE(32, 42);
elf.writeUInt16LE(1, 44);
elf.writeUInt16LE(40, 46);
elf.writeUInt32LE(1, 52); // PT_LOAD
elf.writeUInt32LE(84, 68);
elf.writeUInt32LE(84, 72);
elf.writeUInt32LE(5, 76);
elf.writeUInt32LE(4096, 80);

const directory = resolve("android", "generated", "legacy-jni", "armeabi-v7a");
await mkdir(directory, { recursive: true });
await writeFile(resolve(directory, "libendodeckabi.so"), elf);
