// src/config/load-env.ts
import {
  SSMClient,
  GetParametersByPathCommand,
  Parameter,
} from '@aws-sdk/client-ssm';

/**
 * Carrega as variáveis de ambiente do AWS SSM Parameter Store e as injeta
 * no `process.env` do Node.js.
 */
export const loadEnvFromSSM = async (): Promise<void> => {
  const environment = process.env.NODE_ENV || 'development';
  const ssmPath = `/app/kero-wishlist/${environment}/`;

  // Se estiver rodando localmente, usar variáveis locais
  if (process.env.IS_OFFLINE ||
      process.env.NODE_ENV === 'development' ||
      process.env.SERVERLESS_OFFLINE ||
      !process.env.AWS_REGION) {
    console.log('🔧 Modo local: usando variáveis de ambiente locais');
    return;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.log(`🔍 Buscando variáveis de ambiente do SSM para o ambiente: "${environment}"`);
    console.log(`📍 Caminho no SSM: ${ssmPath}`);
    console.log(`🌍 Região AWS: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`👤 Perfil AWS: ${process.env.AWS_PROFILE || 'default'}`);
  }

  try {
    const region = process.env.AWS_REGION || 'us-east-1';
    const client = new SSMClient({
      region: region,
    });

    if (process.env.NODE_ENV !== 'test') {
      console.log(`🔧 Cliente SSM configurado para região: ${region}`);
    }

    const command = new GetParametersByPathCommand({
      Path: ssmPath,
      Recursive: true,
      WithDecryption: true,
    });

    if (process.env.NODE_ENV !== 'test') {
      console.log(`🚀 Enviando comando para o SSM...`);
    }

    const response = await client.send(command);
    const parameters = response.Parameters || [];

    if (process.env.NODE_ENV !== 'test') {
      console.log(`📊 Total de parâmetros encontrados no SSM: ${parameters.length}`);
    }

    if (parameters.length === 0) {
      console.warn(`⚠️ Nenhuma variável de ambiente encontrada no SSM para o caminho: ${ssmPath}`);
      return;
    }

    const loadedVars: string[] = [];
    parameters.forEach((param: Parameter) => {
      if (param.Name && param.Value) {
        const key = param.Name.replace(ssmPath, '');
        process.env[key] = param.Value;
        loadedVars.push(key);
      }
    });

    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Variáveis de ambiente do SSM carregadas com sucesso!');
      console.log(`📋 Variáveis carregadas (${loadedVars.length}):`, loadedVars);
      console.log('🔐 Valores mascarados por segurança - verifique se as variáveis estão corretas');
    }
  } catch (error) {
    console.error('❌ Falha crítica ao carregar variáveis do SSM:');
    console.error('🔍 Detalhes do erro:', error);

    if (error instanceof Error) {
      console.error('📝 Mensagem de erro:', error.message);
      console.error('📚 Stack trace:', error.stack);
    }

    console.error('💡 Verifique se:');
    console.error('   - O perfil AWS está configurado corretamente');
    console.error('   - As credenciais AWS são válidas');
    console.error('   - A região AWS está correta');
    console.error('   - O caminho do SSM existe');
    console.error('   - Você tem permissões para acessar o SSM');

    throw new Error('Não foi possível carregar as configurações da AWS. Abortando a inicialização.');
  }
};
