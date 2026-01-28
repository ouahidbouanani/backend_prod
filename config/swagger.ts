import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

export type SwaggerOptions = {
  baseUrl?: string;
};

export function createOpenApiSpec(options: SwaggerOptions = {}) {
  const port = process.env.PORT || 3000;
  const baseUrl =
    options.baseUrl || process.env.SWAGGER_BASE_URL || `http://localhost:${port}`;

  const definition = {
    openapi: '3.0.3',
    info: {
      title: 'FrogBox API',
      version: process.env.npm_package_version || '1.0.0',
      description:
        'Documentation Swagger/OpenAPI du backend FrogBox. Utilise les annotations JSDoc dans les fichiers de routes.',
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: 'Auth', description: 'Authentification et comptes' },
      { name: 'Pieces', description: 'Gestion des pièces et de leurs côtes' },
      { name: 'PreAssemblage', description: 'Formulaires Finis: Début/Fin Pré-Assemblage' },
      { name: 'Assemblage', description: 'Formulaires Finis: Assemblage' },
      { name: 'Tomo', description: 'Formulaires Tomographie (Semi/Finis)' },
      { name: 'Impression', description: 'Formulaires Impression' },
      { name: 'Etching', description: 'Formulaires Etching' },
      { name: 'Cotes', description: 'Prise de cotes / Mesures' },
      { name: 'Suivi', description: 'Suivi des lots' },
      { name: 'NC', description: 'Non-conformités' },
      { name: 'Admin', description: 'Référentiels Admin (semi-finis achetés, produits finis, etc.)' },
      { name: 'Calendar', description: 'Calendrier / Events' },
      { name: 'SystemConfig', description: 'Configuration système (activités, imprimantes, ...)' },
      { name: 'Versions', description: 'Versions / Révisions des pièces' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['nom', 'prenom', 'email', 'password'],
          properties: {
            nom: { type: 'string', example: 'Doe' },
            prenom: { type: 'string', example: 'John' },
            email: { type: 'string', example: 'john.doe@treefrog.fr' },
            password: { type: 'string', example: 'motdepassefort' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'john.doe@treefrog.fr' },
            password: { type: 'string', example: 'motdepassefort' },
          },
        },
        AuthLoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Connexion réussie' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                nom: { type: 'string' },
                prenom: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
        CotePiece: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nom_cote: { type: 'string', example: 'Longueur' },
            tolerance_min: { type: 'integer', example: 10 },
            tolerance_max: { type: 'integer', example: 12 },
          },
        },
        Piece: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nom: { type: 'string', example: 'Piece A' },
            nb_cotes: { type: 'integer', example: 2 },
            cotes: {
              type: 'array',
              items: { $ref: '#/components/schemas/CotePiece' },
            },
          },
        },
        CreateOrUpdatePieceRequest: {
          type: 'object',
          required: ['nom_piece', 'nb_cotes', 'cotes'],
          properties: {
            nom_piece: { type: 'string', example: 'Piece A' },
            nb_cotes: { type: 'integer', example: 2 },
            cotes: {
              type: 'array',
              items: {
                type: 'object',
                required: ['nom_cote', 'tolerance_min', 'tolerance_max'],
                properties: {
                  nom_cote: { type: 'string', example: 'Longueur' },
                  tolerance_min: { type: 'integer', example: 10 },
                  tolerance_max: { type: 'integer', example: 12 },
                },
              },
            },
          },
        },

        AvailableLot: {
          type: 'object',
          properties: {
            id_lot: { type: 'integer', example: 123 },
          },
        },
        PiecesDisponiblesResponse: {
          type: 'object',
          properties: {
            id_lot: { type: 'integer', example: 123 },
            nb_piece_disponible: { type: 'integer', example: 42 },
          },
        },
        DebutPreassemblageReference: {
          type: 'object',
          required: ['reference_nom', 'lot_valeur'],
          properties: {
            reference_nom: { type: 'string', example: 'CSK' },
            lot_valeur: { type: 'string', example: '2' },
          },
        },
        DebutPreassemblageCreateRequest: {
          type: 'object',
          required: ['activite', 'produit_fini', 'lot_corps', 'date', 'operateur'],
          properties: {
            activite: { type: 'string', example: 'PROD' },
            produit_fini: { type: 'string', example: 'SK' },
            lot_corps: { type: 'integer', example: 2 },
            date: { type: 'string', example: '2026-01-19' },
            operateur: { type: 'string', example: 'OBO' },
            piece_disponible: { type: 'integer', example: 8 },
            quantite_utilisee: { type: 'integer', example: 5 },
            commentaire: { type: 'string', nullable: true, example: '' },
            references: {
              type: 'array',
              items: { $ref: '#/components/schemas/DebutPreassemblageReference' },
            },
            pieces: {
              type: 'array',
              items: { type: 'string', example: 'CSK-002-01' },
            },
          },
        },
        DebutPreassemblageCreateResponse: {
          type: 'object',
          properties: {
            id_debutpreassemblage: { type: 'string', example: 'ASM-SK-2' },
          },
        },
        DebutPreassemblageListItem: {
          type: 'object',
          properties: {
            id_debutpreassemblage: { type: 'string', example: 'ASM-SK-2' },
            activite: { type: 'string', example: 'PROD' },
            produit_fini: { type: 'string', example: 'SK' },
            lot_corps: { type: 'integer', example: 2 },
            date: { type: 'string', example: '2026-01-19T00:00:00.000Z' },
            operateur: { type: 'string', example: 'OBO' },
            piece_disponible: { type: 'integer', example: 8 },
            quantite_utilisee: { type: 'integer', example: 5 },
            created_at: { type: 'string', example: '2026-01-19T10:20:30.000Z' },
          },
        },
        DebutPreassemblagePiece: {
          type: 'object',
          properties: {
            piece_code: { type: 'string', example: 'CSK-002-01' },
          },
        },
        DebutPreassemblageDetail: {
          type: 'object',
          properties: {
            id_debutpreassemblage: { type: 'string', example: 'ASM-SK-2' },
            activite: { type: 'string', example: 'PROD' },
            produit_fini: { type: 'string', example: 'SK' },
            lot_corps: { type: 'integer', example: 2 },
            piece_disponible: { type: 'integer', example: 8 },
            quantite_utilisee: { type: 'integer', example: 5 },
            references: {
              type: 'array',
              items: { $ref: '#/components/schemas/DebutPreassemblageReference' },
            },
            pieces: {
              type: 'array',
              items: { $ref: '#/components/schemas/DebutPreassemblagePiece' },
            },
          },
        },
        FinPreassemblagePieceInput: {
          type: 'object',
          required: ['piece_code', 'qc_ok'],
          properties: {
            piece_code: { type: 'string', example: 'CSK-002-02' },
            qc_ok: { type: 'boolean', example: true },
          },
        },
        FinPreassemblageCreateRequest: {
          type: 'object',
          required: ['id_debutpreassemblage', 'date', 'operateur'],
          properties: {
            activite: { type: 'string', nullable: true, example: 'PROD' },
            produit_fini: { type: 'string', nullable: true, example: 'SK' },
            id_debutpreassemblage: { type: 'string', example: 'ASM-SK-2' },
            date: { type: 'string', example: '2026-01-20' },
            operateur: { type: 'string', example: 'OBO' },
            commentaire: { type: 'string', nullable: true, example: null },
            pieces: {
              type: 'array',
              items: { $ref: '#/components/schemas/FinPreassemblagePieceInput' },
            },
          },
        },
        FinPreassemblageDetail: {
          type: 'object',
          properties: {
            id_debutpreassemblage: { type: 'string', example: 'ASM-SK-2' },
            date: { type: 'string', example: '2026-01-20T00:00:00.000Z' },
            operateur: { type: 'string', example: 'OBO' },
            commentaire: { type: 'string', nullable: true, example: null },
            pieces: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  piece_code: { type: 'string', example: 'CSK-002-02' },
                  qc_ok: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        FinPreassemblageCreateResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            fin: { $ref: '#/components/schemas/FinPreassemblageDetail' },
            qc_count: { type: 'integer', example: 10 },
          },
        },
      },
    },
  };

  return swaggerJSDoc({
    definition,
    apis: [
      path.join(__dirname, '..', 'routes', '**', '*.ts'),
      path.join(__dirname, '..', 'routes', '**', '*.js'),
      path.join(__dirname, '..', 'controllers', '**', '*.ts'),
      path.join(__dirname, '..', 'controllers', '**', '*.js'),
    ],
  });
}
