import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/semi-finis-pre-assemblage
 * Retourne:
 * [
 *   { id, nom, createdAt, references: [{ id, type, nom, quantite, tracerNumeroLot }] }
 * ]
 */
export async function getAllPreAssemblages(req, res) {
  try {
    const items = await prisma.semiFiniPreAssemblage.findMany({
      orderBy: { id: "desc" },
      include: {
        references: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            type: true,
            nom: true,
            quantite: true,
            tracerNumeroLot: true,
          },
        },
      },
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur (fetch pré-assemblage)." });
  }
}

/**
 * POST /api/semi-finis-pre-assemblage
 * Body attendu:
 * {
 *   nom: string,
 *   references: [{ type, nom, quantite, tracerNumeroLot }]
 * }
 */
export async function createPreAssemblage(req, res) {
  try {
    const { nom, references } = req.body;

    if (!nom || typeof nom !== "string" || !nom.trim()) {
      return res.status(400).json({ message: "Le nom est obligatoire." });
    }

    if (!Array.isArray(references) || references.length === 0) {
      return res.status(400).json({ message: "Au moins une référence est obligatoire." });
    }

    // validation minimale des refs
    const cleanRefs = references
      .filter((r) => r && r.nom && String(r.nom).trim() !== "")
      .map((r) => ({
        type: String(r.type || "semi-finis"),
        nom: String(r.nom).trim(),
        quantite: Number.isFinite(r.quantite) ? r.quantite : parseInt(r.quantite, 10),
        tracerNumeroLot: !!r.tracerNumeroLot,
      }))
      .filter((r) => (r.type === "semi-finis" || r.type === "semi-finis-achetes") && r.quantite > 0);

    if (cleanRefs.length === 0) {
      return res.status(400).json({ message: "Références invalides (nom/quantité/type)." });
    }

    const created = await prisma.semiFiniPreAssemblage.create({
      data: {
        nom: nom.trim(),
        references: {
          create: cleanRefs,
        },
      },
      include: {
        references: {
          select: {
            id: true,
            type: true,
            nom: true,
            quantite: true,
            tracerNumeroLot: true,
          },
        },
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur (create pré-assemblage)." });
  }
}

/**
 * DELETE /api/semi-finis-pre-assemblage/:id
 */
export async function deletePreAssemblage(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID invalide." });
    }

    // Avec onDelete: Cascade, supprimer le parent supprime les refs
    await prisma.semiFiniPreAssemblage.delete({
      where: { id },
    });

    res.json({ message: "Supprimé." });
  } catch (err) {
    console.error(err);

    // Prisma: record not found
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Élément introuvable." });
    }

    res.status(500).json({ message: "Erreur serveur (delete pré-assemblage)." });
  }
}
