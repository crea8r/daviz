/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/daviz.json`.
 */
export type Daviz = {
  "address": "B1EzQtkQo1o3dthdo1XHfc3R8qa4zLwxEwp8ATAW2sDS",
  "metadata": {
    "name": "daviz",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createAssetProfile",
      "discriminator": [
        64,
        188,
        118,
        227,
        25,
        179,
        19,
        127
      ],
      "accounts": [
        {
          "name": "assetProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  115,
                  101,
                  116,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "assetId"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "assetId",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "assetType",
          "type": {
            "defined": {
              "name": "assetType"
            }
          }
        },
        {
          "name": "metadataUri",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "createTrustFramework",
      "discriminator": [
        25,
        151,
        137,
        4,
        185,
        248,
        19,
        0
      ],
      "accounts": [
        {
          "name": "trustFramework",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  117,
                  115,
                  116,
                  95,
                  102,
                  114,
                  97,
                  109,
                  101,
                  119,
                  111,
                  114,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "frameworkId"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "frameworkId",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "criteria",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "issueTrust",
      "discriminator": [
        40,
        228,
        66,
        228,
        111,
        103,
        29,
        220
      ],
      "accounts": [
        {
          "name": "trustRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  117,
                  115,
                  116,
                  95,
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "frameworkKey"
              },
              {
                "kind": "account",
                "path": "issuer"
              },
              {
                "kind": "arg",
                "path": "assetKey"
              }
            ]
          }
        },
        {
          "name": "trustFramework"
        },
        {
          "name": "assetProfile"
        },
        {
          "name": "issuer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "frameworkKey",
          "type": "pubkey"
        },
        {
          "name": "assetKey",
          "type": "pubkey"
        },
        {
          "name": "trustScore",
          "type": "u8"
        },
        {
          "name": "evidence",
          "type": "string"
        },
        {
          "name": "expiresAt",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "updateTrustFramework",
      "discriminator": [
        252,
        108,
        101,
        143,
        81,
        21,
        84,
        179
      ],
      "accounts": [
        {
          "name": "trustFramework",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  117,
                  115,
                  116,
                  95,
                  102,
                  114,
                  97,
                  109,
                  101,
                  119,
                  111,
                  114,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "trust_framework.framework_id",
                "account": "trustFramework"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "description",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "criteria",
          "type": {
            "option": {
              "vec": "string"
            }
          }
        },
        {
          "name": "isActive",
          "type": {
            "option": "bool"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "assetProfile",
      "discriminator": [
        179,
        38,
        126,
        96,
        132,
        188,
        194,
        226
      ]
    },
    {
      "name": "trustFramework",
      "discriminator": [
        193,
        148,
        72,
        209,
        21,
        100,
        16,
        25
      ]
    },
    {
      "name": "trustRecord",
      "discriminator": [
        44,
        105,
        63,
        202,
        3,
        98,
        156,
        170
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "nameTooLong",
      "msg": "Asset name is too long"
    },
    {
      "code": 6001,
      "name": "descriptionTooLong",
      "msg": "Asset description is too long"
    },
    {
      "code": 6002,
      "name": "metadataUriTooLong",
      "msg": "Metadata URI is too long"
    }
  ],
  "types": [
    {
      "name": "assetProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "assetId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "assetType",
            "type": {
              "defined": {
                "name": "assetType"
              }
            }
          },
          {
            "name": "metadataUri",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "assetType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "business"
          },
          {
            "name": "realEstate"
          },
          {
            "name": "intellectual"
          },
          {
            "name": "digital"
          },
          {
            "name": "other"
          }
        ]
      }
    },
    {
      "name": "trustFramework",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "frameworkId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "criteria",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "trustRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "framework",
            "type": "pubkey"
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "targetAsset",
            "type": "pubkey"
          },
          {
            "name": "trustScore",
            "type": "u8"
          },
          {
            "name": "evidence",
            "type": "string"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "issuedAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    }
  ]
};
