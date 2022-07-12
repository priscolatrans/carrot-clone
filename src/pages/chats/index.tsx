import styled from 'styled-components';
import useSWR from 'swr';
import { getChatList } from 'src/api/chat';
import { useRouter } from 'next/router';
import Tabbar from '@components/Layout/Tabbar';
import Appbar from '@components/Layout/Appbar';
import Loading from '@components/Loading/Loading';
import Image from 'next/image';

interface MessageStructureType {
  chatId: number;
  createdAt: string;
  id: number;
  message: string;
  productId: number;
  updatedAt: string;
  userId: number;
}
interface ChatStructureType {
  createdAt: string;
  id: string;
  messages: Array<MessageStructureType>;
  productId: string;
  updatedAt: string;
  product: {
    description: string;
    name: string;
    price: number;
    user: {
      id: number;
      name: string;
      avatar?: string;
    };
  };
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  userId: number;
}

const ChatContainer = styled.div`
  padding-top: 5rem;
`;

const ChatItemBox = styled.div`
  display: flex;
  padding: 2rem;
  border-bottom: 1px solid var(--gray-1);
`;

const ChatItemImage = styled.div`
  position: relative;
  width: 3rem;
  height: 3rem;
`;

const ChatItemContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 1rem;

  font-size: 1.4rem;
  strong {
    font-weight: var(--weight-500);
  }
  p {
    font-weight: var(--weight-400);
    line-height: 2.2rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 28rem;
  }
`;

const Chats = () => {
  const router = useRouter();
  const chat_data = useSWR<Array<ChatStructureType>>(`/api/chats`, getChatList);

  const moveRouter = (chat_id: string, product_id: string) => {
    router.push({
      pathname: `/chats/${chat_id}`,
      query: {
        chat_id,
        product_id,
      },
    });
  };

  if (chat_data.error) return <div>...에러</div>;
  if (!chat_data.data) return <Loading />;

  console.log(chat_data.data);

  return (
    <>
      <Appbar title="채팅" backButtonDisable={true} />
      <ChatContainer>
        {chat_data.data.map((chat_info, i) => (
          <ChatItemBox onClick={() => moveRouter(chat_info.id, chat_info.productId)} key={i}>
            <ChatItemImage>
              <Image
                src={`${process.env.NEXT_PUBLIC_CF_IMAGE}/${chat_info.product.user.avatar}/avatar`}
                alt=""
                width={280}
                height={280}
                layout="fill"
                style={{ borderRadius: '50%' }}
              />
            </ChatItemImage>
            <ChatItemContent>
              <strong>{chat_info.product.user.name}</strong>
              <p>{chat_info.messages[chat_info.messages.length - 1]?.message}</p>
            </ChatItemContent>
          </ChatItemBox>
        ))}
      </ChatContainer>
      <Tabbar />
    </>
  );
};

export default Chats;
