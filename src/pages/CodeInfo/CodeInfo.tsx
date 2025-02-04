import React, { useState, useEffect } from "react";
import DynamicTable from "../../components/Table/DynamicTable";
import Search from "../../components/Table/Search";
import {
  Button,
  Card,
  TitleContainer,
  Title,
} from "../../styles/styledTableLayout";
import Pagination from "../../components/Table/Pagination";
import { useList } from "../../customHooks/useList";
import { fetchCodeList } from "../../recoil/atoms/code";
import { useRecoilValue, useRecoilState } from "recoil";
import { codeListAtom } from "../../recoil/atoms/code";
import { FetchListParams } from "../../utils/types";
import { selectedRowAtom } from "../../recoil/atoms/selected";
import { dynamicObject } from "../../utils/types";
import Error from "../Error";
import AddCodeInfo from "./AddCodeInfo";
import DeleteCodeInfo from "./DeleteCodeInfo";
import EditCodeInfo from "./EditCodeInfo";

// 코드 정보 모록
const CodeInfo: React.FC = () => {
  const [recoilData, setRecoilData] = useRecoilState(codeListAtom);
  const selectedRow = useRecoilValue(selectedRowAtom);
  const itemsPerPage = 5;
  const [headers, setHeaders] = useState<string[]>([]);
  const [keyName, setKeyname] = useState<string[] | null>(null);
  const [headerInfos, setHeaderInfos] = useState<dynamicObject[] | null>(null);
  const [data, setData] = useState<dynamicObject[] | null>(null);
  const [totCnt, setTotCnt] = useState<number | null>(null);
  const [error, setError] = useState<dynamicObject | null>(null);

  const fetchListData = async ({
    isHeaderInfo,
    rowCnt,
    startNum,
    sortKeyName,
    order,
    filter,
    filterArrAndOr,
    filterArr,
  }: FetchListParams) => {
    const result = await fetchCodeList({
      isHeaderInfo,
      rowCnt,
      startNum,
      sortKeyName,
      order,
      filter,
      filterArrAndOr,
      filterArr,
    });

    if (result?.body) {
      setRecoilData(result);
    } else {
      setError(result?.error);
    }
  };

  const [params, setParams] = useState<FetchListParams>({
    isHeaderInfo: true,
    rowCnt: itemsPerPage,
    startNum: 0,
    sortKeyName: "created_at",
    order: "DESC",
  });

  const {
    sortOption,
    handleSort,
    currentPage,
    handlePageChange,
    handleRefresh,
    handleSearch,
  } = useList(itemsPerPage, params, setParams, fetchListData);

  useEffect(() => {
    fetchListData(params);
  }, []);

  useEffect(() => {
    if (recoilData) {
      const headers = recoilData?.body?.headerInfos
        .concat({
          idx: 8,
          keyName: "code_enum",
          name: "ENUM",
          filter: false,
          sort: false,
          display: true,
        })
        .filter((item: { [key: string]: any }) => item.display) // Only items with display as true
        .map((item: { [key: string]: any }) => item.name);

      const keyName = recoilData?.body?.headerInfos
        .concat({
          idx: 8,
          keyName: "code_enum",
          name: "ENUM",
          filter: false,
          sort: false,
          display: true,
        })
        .filter((item: { [key: string]: any }) => item.display) // Only items with display as true
        .map((item: { [key: string]: any }) => item.keyName);

      const { headerInfos, codeInfoList, totalCnt } = recoilData?.body;

      setHeaders(headers);
      setKeyname(keyName);
      setHeaderInfos(
        headerInfos.concat({
          idx: 8,
          keyName: "code_enum",
          name: "ENUM",
          filter: false,
          sort: false,
          display: true,
        })
      );
      setData(codeInfoList);
      setTotCnt(totalCnt);
    }
  }, [recoilData]);

  if (recoilData === null || error) {
    return (
      <>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              //   border: "1px solid red",
            }}
          >
            <Error error={error} />
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card>
        <TitleContainer>
          <Title>코드 정보</Title>
        </TitleContainer>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <Search label="코드명" onSearch={handleSearch} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "2px",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <AddCodeInfo handleRefresh={handleRefresh}>
              <Button>추가</Button>
            </AddCodeInfo>
            <EditCodeInfo handleRefresh={handleRefresh}>
              <Button disabled={selectedRow === null}>변경</Button>
            </EditCodeInfo>
            <DeleteCodeInfo handleRefresh={handleRefresh}>
              <Button disabled={selectedRow === null}>삭제</Button>
            </DeleteCodeInfo>
          </div>
        </div>

        <DynamicTable
          headers={headers}
          data={data}
          keyName={keyName}
          checkbox={true}
          headerInfos={headerInfos}
          sortOption={sortOption}
          handleSort={handleSort}
          height="400px"
        />

        {totCnt !== null && totCnt > 0 && (
          <div style={{ padding: "10px 10px" }}>
            <Pagination
              currentPage={currentPage}
              totCnt={totCnt}
              itemsPerPage={itemsPerPage}
              handlePageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </>
  );
};

export default CodeInfo;
