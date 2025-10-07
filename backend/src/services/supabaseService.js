const supabase = require('../config/supabase');

class SupabaseService {
  // Buscar todos os clientes
  async listarClientes(limit = 1000, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('create_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data,
        total: count
      };
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buscar cliente por whatsapp
  async buscarCliente(whatsapp) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('whatsapp', whatsapp)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buscar clientes por filtro
  async filtrarClientes(filtros) {
    try {
      let query = supabase.from('clientes').select('*');

      // Aplicar filtros
      if (filtros.nome) {
        query = query.ilike('nome', `%${filtros.nome}%`);
      }

      if (filtros.whatsapp || filtros.telefone) {
        const numero = filtros.whatsapp || filtros.telefone;
        query = query.ilike('whatsapp', `%${numero}%`);
      }

      if (filtros.ia_instancia) {
        query = query.eq('ia_instancia', filtros.ia_instancia);
      }

      if (filtros.pausado !== undefined) {
        query = query.eq('pausado', filtros.pausado);
      }

      const { data, error } = await query.order('create_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro ao filtrar clientes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Contar clientes
  async contarClientes() {
    try {
      const { count, error } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return {
        success: true,
        total: count
      };
    } catch (error) {
      console.error('Erro ao contar clientes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Atualizar data_follow do cliente
  async atualizarDataFollow(whatsapp) {
    try {
      const agora = new Date().toISOString();

      const { error } = await supabase
        .from('clientes')
        .update({ data_follow: agora })
        .eq('whatsapp', whatsapp);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Erro ao atualizar data_follow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SupabaseService();
