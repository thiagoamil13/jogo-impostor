// Banco de palavras — fica SÓ no servidor. O cliente nunca recebe a lista.
export const PAIRS = {
  "Comidas": [["Pizza","Lasanha"],["Brigadeiro","Beijinho"],["Hambúrguer","Hot Dog"],["Café","Chá"],["Sorvete","Açaí"],["Maçã","Pera"],["Bolo","Torta"],["Pipoca","Amendoim"],["Sushi","Temaki"],["Churrasco","Espetinho"],["Coxinha","Empada"],["Pastel","Esfiha"],["Feijoada","Estrogonofe"],["Pudim","Flan"]],
  "Animais": [["Cachorro","Lobo"],["Gato","Tigre"],["Leão","Onça"],["Cavalo","Burro"],["Galinha","Pato"],["Cobra","Jacaré"],["Golfinho","Tubarão"],["Coelho","Lebre"],["Abelha","Vespa"],["Águia","Falcão"],["Macaco","Gorila"],["Rato","Hamster"]],
  "Lugares": [["Praia","Piscina"],["Cinema","Teatro"],["Shopping","Supermercado"],["Escola","Faculdade"],["Hospital","Clínica"],["Hotel","Motel"],["Fazenda","Sítio"],["Biblioteca","Livraria"],["Praia","Parque Aquático"],["Igreja","Templo"],["Aeroporto","Rodoviária"],["Academia","Parque"]],
  "Objetos": [["Celular","Tablet"],["Garfo","Colher"],["Óculos","Lente"],["Mochila","Mala"],["Cadeira","Banco"],["Ventilador","Ar-condicionado"],["Relógio","Cronômetro"],["Caneta","Lápis"],["Chave","Cadeado"],["Guarda-chuva","Sombrinha"],["Geladeira","Freezer"],["Travesseiro","Almofada"],["Espelho","Janela"],["Vassoura","Rodo"]],
  "Profissões": [["Médico","Enfermeiro"],["Professor","Diretor"],["Bombeiro","Policial"],["Advogado","Juiz"],["Dentista","Ortodontista"],["Mecânico","Eletricista"],["Piloto","Comissário"],["Cozinheiro","Confeiteiro"],["Jornalista","Escritor"],["Cantor","Músico"],["Barbeiro","Cabeleireiro"],["Pedreiro","Arquiteto"]],
  "Filmes e séries": [["Harry Potter","Percy Jackson"],["Batman","Superman"],["Shrek","Madagascar"],["Toy Story","Carros"],["Frozen","Moana"],["Os Simpsons","Family Guy"],["Vingadores","Liga da Justiça"],["Round 6","Alice in Borderland"],["Stranger Things","Dark"],["Rei Leão","Bambi"]],
  "Jogos": [["Minecraft","Terraria"],["Free Fire","PUBG"],["Valorant","CS"],["FIFA","eFootball"],["Roblox","Minecraft"],["GTA","Red Dead"],["Fortnite","Apex"],["Among Us","Fall Guys"],["Mario","Sonic"],["Zelda","Genshin"]],
  "Esporte": [["Futebol","Basquete"],["Vôlei","Handebol"],["Natação","Surfe"],["Tênis","Ping-Pong"],["Boxe","MMA"],["Corrida","Ciclismo"],["Skate","Patins"],["Xadrez","Damas"]],
  "Transporte": [["Carro","Moto"],["Avião","Helicóptero"],["Bicicleta","Patinete"],["Ônibus","Metrô"],["Navio","Barco"],["Trem","Bonde"],["Caminhão","Van"],["Táxi","Uber"]],
  "Fácil de confundir": [["Sol","Lua"],["Dia","Noite"],["Fogo","Fumaça"],["Ouro","Prata"],["Céu","Espaço"],["Rio","Lago"],["Montanha","Vulcão"],["Flor","Árvore"],["Chuva","Neve"],["Areia","Terra"],["Vento","Furacão"],["Gelo","Água"]],
  "Difíceis": [["Café","Capuccino"],["Livro","Revista"],["Avião","Helicóptero"],["Bicicleta","Patinete"],["Violão","Guitarra"],["Piano","Teclado"],["Chocolate","Cacau"],["Mel","Açúcar"],["Vinho","Suco de uva"],["Sonho","Pesadelo"],["Memória","Lembrança"],["Ciúme","Inveja"]],
  "Datas e festas": [["Natal","Ano Novo"],["Carnaval","Festa Junina"],["Aniversário","Casamento"],["Páscoa","Dia das Crianças"],["Halloween","Dia dos Mortos"],["Formatura","Chá de bebê"]]
};
export const CATS = Object.keys(PAIRS);
