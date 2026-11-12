// Recorta o objeto de uma foto de estúdio (fundo liso) com o "recorte de objeto" do macOS (Vision), sem serviço externo.
// uso: swift fonte/recorta.swift <entrada.png> <saida.png>
// Sai um PNG com alfa no tamanho da entrada, só com o objeto em primeiro plano.
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 3 else { print("uso: swift recorta.swift <entrada.png> <saida.png>"); exit(2) }
let entrada = URL(fileURLWithPath: args[1]), saida = URL(fileURLWithPath: args[2])

guard let fonte = CGImageSourceCreateWithURL(entrada as CFURL, nil),
      let imagem = CGImageSourceCreateImageAtIndex(fonte, 0, nil) else { print("não abriu \(entrada.path)"); exit(1) }

let pedido = VNGenerateForegroundInstanceMaskRequest()
let manipulador = VNImageRequestHandler(cgImage: imagem, options: [:])
do { try manipulador.perform([pedido]) } catch { print("Vision falhou: \(error)"); exit(1) }
guard let resultado = pedido.results?.first else { print("nenhum objeto em \(entrada.lastPathComponent)"); exit(1) }

do {
  let recorte = try resultado.generateMaskedImage(ofInstances: resultado.allInstances, from: manipulador, croppedToInstancesExtent: false)
  let ci = CIImage(cvPixelBuffer: recorte)
  let ctx = CIContext()
  guard let cg = ctx.createCGImage(ci, from: ci.extent, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!) else { print("sem imagem"); exit(1) }
  guard let destino = CGImageDestinationCreateWithURL(saida as CFURL, UTType.png.identifier as CFString, 1, nil) else { exit(1) }
  CGImageDestinationAddImage(destino, cg, nil)
  CGImageDestinationFinalize(destino)
  print("ok \(saida.path) \(cg.width)x\(cg.height)")
} catch { print("máscara falhou: \(error)"); exit(1) }
