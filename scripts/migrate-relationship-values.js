#!/usr/bin/env node

/**
 * Script de Migração: Atualizar valores de relationship (JavaScript)
 *
 * Este script migra os valores antigos do campo relationship para os novos valores do enum:
 * - son, daughter -> CHILD
 * - brother, sister -> SIBLING
 * - nephew, niece -> NIBLING
 * - grandson, granddaughter -> NIBLING
 * - other -> OTHER
 *
 * Uso: node scripts/migrate-relationship-values.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Mapeamento dos valores antigos para os novos
const RELATIONSHIP_MAPPING = {
  // Filhos
  'son': 'CHILD',
  'daughter': 'CHILD',

  // Irmãos
  'brother': 'SIBLING',
  'sister': 'SIBLING',

  // Sobrinhos
  'nephew': 'NIBLING',
  'niece': 'NIBLING',

  // Netos
  'grandson': 'NIBLING',
  'granddaughter': 'NIBLING',

  // Outros
  'other': 'OTHER',
};

async function migrateRelationshipValues() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wishlist-backend';

  console.log('🚀 Iniciando migração dos valores de relationship...');
  console.log(`📡 Conectando ao MongoDB: ${mongoUri}`);

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Buscar todos os usuários que são dependentes e têm relationship definido
    const dependents = await usersCollection.find({
      isDependent: true,
      relationship: { $exists: true, $ne: null }
    }).toArray();

    console.log(`📊 Encontrados ${dependents.length} dependentes com relationship definido`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const dependent of dependents) {
      const oldValue = dependent.relationship;
      const newValue = RELATIONSHIP_MAPPING[oldValue];

      if (!newValue) {
        console.log(`⚠️  Valor desconhecido encontrado: "${oldValue}" para dependente ${dependent._id}`);
        skippedCount++;
        continue;
      }

      if (oldValue === newValue) {
        console.log(`✅ Valor já atualizado: "${oldValue}" para dependente ${dependent._id}`);
        skippedCount++;
        continue;
      }

      try {
        await usersCollection.updateOne(
          { _id: dependent._id },
          { $set: { relationship: newValue } }
        );

        console.log(`🔄 Migrado: "${oldValue}" -> "${newValue}" para dependente ${dependent._id}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar dependente ${dependent._id}:`, error);
        errorCount++;
      }
    }

    console.log('\n📈 Resumo da migração:');
    console.log(`✅ Atualizados: ${updatedCount}`);
    console.log(`⏭️  Pulados: ${skippedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total processados: ${dependents.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migração concluída com sucesso!');
    } else {
      console.log('\n⚠️  Migração concluída com alguns erros. Verifique os logs acima.');
    }

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Conexão com MongoDB fechada');
  }
}

// Executar migração
migrateRelationshipValues()
  .then(() => {
    console.log('✨ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
