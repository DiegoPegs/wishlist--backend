import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI');
        const defaultUri = 'mongodb://localhost:27017/wishlist-backend';
        const finalUri = mongoUri || defaultUri;

        // Logs detalhados sobre a origem da URL do MongoDB
        console.log('🔍 Configuração do MongoDB:');
        console.log(`   📋 MONGODB_URI do ConfigService: ${mongoUri || 'undefined'}`);
        console.log(`   🔧 URL padrão (fallback): ${defaultUri}`);
        console.log(`   ✅ URL final escolhida: ${finalUri}`);

        // Verificar se está usando valor padrão
        if (!mongoUri) {
          console.warn('⚠️ ATENÇÃO: Usando URL padrão do MongoDB!');
          console.warn('   Isso pode indicar que:');
          console.warn('   - A variável MONGODB_URI não está definida');
          console.warn('   - O SSM não foi carregado corretamente');
          console.warn('   - O ConfigService não está funcionando');
        } else {
          console.log('✅ URL do MongoDB carregada com sucesso do ConfigService');
        }

        return {
          uri: finalUri,
          retryWrites: true,
          w: 'majority',
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
